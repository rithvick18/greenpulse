from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.api.v1.dependencies import get_current_user, require_role
from app.models.node import Node
from app.models.user import User
from app.schemas.node import NodeCreate, NodeUpdate, NodeResponse

router = APIRouter()
write_roles = require_role(["admin", "operator"])


@router.get("", response_model=List[NodeResponse])
async def list_nodes(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all telemetry nodes with status.
    """
    result = await db.execute(select(Node).offset(skip).limit(limit))
    nodes = result.scalars().all()
    return nodes


@router.post("", response_model=NodeResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(write_roles)])
async def create_node(
    node_in: NodeCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new telemetry node (Admin or Operator).
    """
    result = await db.execute(select(Node).where(Node.id == node_in.id))
    if result.scalar_one_or_none():
        raise NotFoundException(detail=f"Node with ID '{node_in.id}' already exists")

    node = Node(
        id=node_in.id,
        name=node_in.name,
        location_lat=node_in.location_lat,
        location_lon=node_in.location_lon,
        status=node_in.status,
        node_type=node_in.node_type,
        metadata_json=node_in.metadata_json,
    )
    db.add(node)
    await db.commit()
    await db.refresh(node)
    return node


@router.get("/{node_id}", response_model=NodeResponse)
async def get_node(
    node_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get node by ID.
    """
    result = await db.execute(select(Node).where(Node.id == node_id))
    node = result.scalar_one_or_none()
    if not node:
        raise NotFoundException(detail=f"Node with ID '{node_id}' not found")
    return node


@router.put("/{node_id}", response_model=NodeResponse, dependencies=[Depends(write_roles)])
@router.patch("/{node_id}", response_model=NodeResponse, dependencies=[Depends(write_roles)])
async def update_node(
    node_id: str,
    node_in: NodeUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Update telemetry node (Admin or Operator).
    """
    result = await db.execute(select(Node).where(Node.id == node_id))
    node = result.scalar_one_or_none()
    if not node:
        raise NotFoundException(detail=f"Node with ID '{node_id}' not found")

    if node_in.name:
        node.name = node_in.name
    if node_in.location_lat is not None:
        node.location_lat = node_in.location_lat
    if node_in.location_lon is not None:
        node.location_lon = node_in.location_lon
    if node_in.status:
        node.status = node_in.status
    if node_in.node_type:
        node.node_type = node_in.node_type
    if node_in.metadata_json is not None:
        node.metadata_json = node_in.metadata_json

    await db.commit()
    await db.refresh(node)
    return node


@router.delete("/{node_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_role(["admin"]))])
async def delete_node(
    node_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Delete telemetry node (Admin only).
    """
    result = await db.execute(select(Node).where(Node.id == node_id))
    node = result.scalar_one_or_none()
    if not node:
        raise NotFoundException(detail=f"Node with ID '{node_id}' not found")

    await db.delete(node)
    await db.commit()
    return None
