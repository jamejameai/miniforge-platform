import re
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.tenant import User
from app.models.app import App
from app.models.database_studio import AppTable, AppField, AppRecord
from app.schemas.database_studio import (
    TableCreate, TableOut, FieldCreate, FieldOut,
    RecordCreate, RecordUpdate, RecordOut
)
from app.api.deps import get_current_user

router = APIRouter(tags=["Database Studio"])

@router.get("/apps/{app_id}/tables", response_model=List[TableOut])
async def list_tables(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AppTable).where(
        AppTable.app_id == app_id,
        AppTable.tenant_id == current_user.tenant_id
    ).order_by(AppTable.created_at)
    res = await db.execute(stmt)
    tables = res.scalars().all()
    # Explicitly load fields for each table
    out = []
    for t in tables:
        f_stmt = select(AppField).where(AppField.table_id == t.id).order_by(AppField.created_at)
        f_res = await db.execute(f_stmt)
        fields = f_res.scalars().all()
        t_dict = TableOut(
            id=t.id,
            tenant_id=t.tenant_id,
            app_id=t.app_id,
            name=t.name,
            display_name=t.display_name,
            description=t.description,
            created_at=t.created_at,
            fields=[FieldOut.model_validate(f) for f in fields]
        )
        out.append(t_dict)
    return out

@router.post("/apps/{app_id}/tables", response_model=TableOut)
async def create_table(
    app_id: str,
    req: TableCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify app exists
    app_stmt = select(App).where(App.id == app_id, App.tenant_id == current_user.tenant_id)
    app_res = await db.execute(app_stmt)
    if not app_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Application not found.")

    table_name = re.sub(r"[^a-z0-9_]+", "_", req.name.lower()).strip("_")
    # Verify table name unique in app
    existing_stmt = select(AppTable).where(AppTable.app_id == app_id, AppTable.name == table_name)
    existing_res = await db.execute(existing_stmt)
    if existing_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Table with name '{table_name}' already exists.")

    new_table = AppTable(
        tenant_id=current_user.tenant_id,
        app_id=app_id,
        name=table_name,
        display_name=req.display_name,
        description=req.description or ""
    )
    db.add(new_table)
    await db.flush()

    # Create optional fields
    fields_out = []
    if req.fields:
        for f in req.fields:
            field_name = re.sub(r"[^a-z0-9_]+", "_", f.name.lower()).strip("_")
            field = AppField(
                table_id=new_table.id,
                name=field_name,
                label=f.label,
                field_type=f.field_type,
                is_required=f.is_required,
                is_unique=f.is_unique,
                default_value=f.default_value,
                options=f.options
            )
            db.add(field)
            await db.flush()
            fields_out.append(FieldOut.model_validate(field))

    await db.commit()
    await db.refresh(new_table)
    return TableOut(
        id=new_table.id,
        tenant_id=new_table.tenant_id,
        app_id=new_table.app_id,
        name=new_table.name,
        display_name=new_table.display_name,
        description=new_table.description,
        fields=fields_out,
        created_at=new_table.created_at
    )

@router.post("/tables/{table_id}/fields", response_model=FieldOut)
async def add_field(
    table_id: str,
    req: FieldCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    t_stmt = select(AppTable).where(AppTable.id == table_id, AppTable.tenant_id == current_user.tenant_id)
    t_res = await db.execute(t_stmt)
    table = t_res.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found.")

    field_name = re.sub(r"[^a-z0-9_]+", "_", req.name.lower()).strip("_")
    field = AppField(
        table_id=table.id,
        name=field_name,
        label=req.label,
        field_type=req.field_type,
        is_required=req.is_required,
        is_unique=req.is_unique,
        default_value=req.default_value,
        options=req.options
    )
    db.add(field)
    await db.commit()
    await db.refresh(field)
    return field

@router.get("/tables/{table_id}/records", response_model=List[RecordOut])
async def list_records(
    table_id: str,
    limit: int = 100,
    offset: int = 0,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AppRecord).where(
        AppRecord.table_id == table_id,
        AppRecord.tenant_id == current_user.tenant_id
    ).order_by(desc(AppRecord.created_at)).offset(offset).limit(limit)
    res = await db.execute(stmt)
    records = res.scalars().all()

    if search:
        search_lower = search.lower()
        records = [
            r for r in records
            if any(search_lower in str(v).lower() for v in r.data.values())
        ]

    return records

@router.post("/tables/{table_id}/records", response_model=RecordOut)
async def create_record(
    table_id: str,
    req: RecordCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    t_stmt = select(AppTable).where(AppTable.id == table_id, AppTable.tenant_id == current_user.tenant_id)
    t_res = await db.execute(t_stmt)
    table = t_res.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found.")

    # Validate against table fields
    f_stmt = select(AppField).where(AppField.table_id == table_id)
    f_res = await db.execute(f_stmt)
    fields = f_res.scalars().all()

    record_data = req.data.copy()
    for f in fields:
        if f.is_required and (f.name not in record_data or record_data[f.name] in (None, "")):
            raise HTTPException(status_code=400, detail=f"Field '{f.label}' ({f.name}) is required.")
        if f.name not in record_data and f.default_value is not None:
            record_data[f.name] = f.default_value

    record = AppRecord(
        tenant_id=current_user.tenant_id,
        table_id=table.id,
        data=record_data
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record

@router.put("/records/{record_id}", response_model=RecordOut)
async def update_record(
    record_id: str,
    req: RecordUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    r_stmt = select(AppRecord).where(AppRecord.id == record_id, AppRecord.tenant_id == current_user.tenant_id)
    r_res = await db.execute(r_stmt)
    record = r_res.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found.")

    updated_data = record.data.copy()
    updated_data.update(req.data)
    record.data = updated_data
    await db.commit()
    await db.refresh(record)
    return record

@router.delete("/records/{record_id}")
async def delete_record(
    record_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    r_stmt = select(AppRecord).where(AppRecord.id == record_id, AppRecord.tenant_id == current_user.tenant_id)
    r_res = await db.execute(r_stmt)
    record = r_res.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found.")

    await db.delete(record)
    await db.commit()
    return {"message": "Record deleted successfully."}
