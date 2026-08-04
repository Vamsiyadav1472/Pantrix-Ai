"""
PantrixAI – Scan History route
GET  /scan-history/{user_id}          – get scan history
POST /scan-history/{user_id}          – save a scan result
DELETE /scan-history/{scan_id}        – delete a scan entry
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import crud
import schemas

router = APIRouter()


@router.post(
    "/{user_id}",
    response_model=schemas.ScanHistoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save a scan result",
)
def save_scan_result(
    user_id: int,
    scan: schemas.ScanHistoryCreate,
    db: Session = Depends(get_db),
):
    from models import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_scan(db, user_id=user_id, scan=scan)


@router.get(
    "/{user_id}",
    response_model=List[schemas.ScanHistoryResponse],
    summary="Get scan history for a user",
)
def get_scan_history(
    user_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return crud.get_scan_history(db, user_id=user_id, limit=limit)


@router.delete(
    "/entry/{scan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a scan entry",
)
def delete_scan(scan_id: int, db: Session = Depends(get_db)):
    from models import ScanHistory
    entry = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Scan entry not found")
    db.delete(entry)
    db.commit()
