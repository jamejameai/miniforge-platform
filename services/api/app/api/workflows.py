from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.tenant import User
from app.models.workflow import Workflow, WorkflowExecution
from app.schemas.workflow import (
    WorkflowCreate, WorkflowUpdate, WorkflowOut,
    WorkflowExecutionOut, WorkflowRunRequest, WorkflowRunResult
)
from app.services.workflow_runner import WorkflowRunner
from app.api.deps import get_current_user

router = APIRouter(tags=["Workflow Studio"])

@router.get("/apps/{app_id}/workflows", response_model=List[WorkflowOut])
async def list_workflows(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workflow).where(
        Workflow.app_id == app_id,
        Workflow.tenant_id == current_user.tenant_id
    ).order_by(Workflow.created_at)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/apps/{app_id}/workflows", response_model=WorkflowOut)
async def create_workflow(
    app_id: str,
    req: WorkflowCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    wf = Workflow(
        tenant_id=current_user.tenant_id,
        app_id=app_id,
        name=req.name,
        description=req.description or "",
        is_active=req.is_active,
        trigger_type=req.trigger_type,
        trigger_config=req.trigger_config or {},
        conditions=req.conditions or [],
        actions=req.actions or []
    )
    db.add(wf)
    await db.commit()
    await db.refresh(wf)
    return wf

@router.put("/workflows/{workflow_id}", response_model=WorkflowOut)
async def update_workflow(
    workflow_id: str,
    req: WorkflowUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workflow).where(
        Workflow.id == workflow_id,
        Workflow.tenant_id == current_user.tenant_id
    )
    res = await db.execute(stmt)
    wf = res.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found.")

    for k, v in req.model_dump(exclude_unset=True).items():
        setattr(wf, k, v)

    await db.commit()
    await db.refresh(wf)
    return wf

@router.delete("/workflows/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workflow).where(
        Workflow.id == workflow_id,
        Workflow.tenant_id == current_user.tenant_id
    )
    res = await db.execute(stmt)
    wf = res.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found.")

    await db.delete(wf)
    await db.commit()
    return {"message": "Workflow deleted successfully."}

@router.post("/workflows/{workflow_id}/run-test", response_model=WorkflowRunResult)
async def run_test_workflow(
    workflow_id: str,
    req: WorkflowRunRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Workflow).where(
        Workflow.id == workflow_id,
        Workflow.tenant_id == current_user.tenant_id
    )
    res = await db.execute(stmt)
    wf = res.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found.")

    execution = await WorkflowRunner.execute_workflow(
        db=db,
        workflow=wf,
        trigger_payload=req.trigger_payload
    )

    return WorkflowRunResult(
        execution_id=execution.id,
        status=execution.status,
        duration_ms=execution.duration_ms,
        actions_executed=len(wf.actions or []),
        logs=execution.execution_logs
    )

@router.get("/workflows/{workflow_id}/executions", response_model=List[WorkflowExecutionOut])
async def list_workflow_executions(
    workflow_id: str,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(WorkflowExecution).where(
        WorkflowExecution.workflow_id == workflow_id,
        WorkflowExecution.tenant_id == current_user.tenant_id
    ).order_by(desc(WorkflowExecution.created_at)).limit(limit)
    res = await db.execute(stmt)
    return res.scalars().all()
