from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.schemas import ProjectCreateRequest, ProjectResponse, ProjectUpdateRequest
from app.core.security import get_current_user
from app.database import get_db
from app.services import auth_service, project_service

router = APIRouter()


def _dict_to_response(data: dict) -> ProjectResponse:
    return ProjectResponse(**data)


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    sort: str = "latest",
    search: str = "",
    db: Session = Depends(get_db),
) -> list[ProjectResponse]:
    projects = project_service.list_public_projects(db, sort=sort, search=search)
    return [_dict_to_response(p) for p in projects]


@router.get("/me", response_model=list[ProjectResponse])
async def list_my_projects(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProjectResponse]:
    username: str = current_user.get("sub", "")
    user = auth_service.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    projects = project_service.list_user_projects(db, user.id)
    return [_dict_to_response(p) for p in projects]


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    username: str = current_user.get("sub", "")
    user = auth_service.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    data = project_service.create_project(
        db,
        user_id=user.id,
        author_username=user.username,
        title=body.title,
        emoji=body.emoji,
        description=body.description,
        tags=body.tags,
    )
    return _dict_to_response(data)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: Session = Depends(get_db)) -> ProjectResponse:
    data = project_service.get_project(db, project_id)
    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return _dict_to_response(data)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    body: ProjectUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    username: str = current_user.get("sub", "")
    user = auth_service.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    existing = project_service.get_project(db, project_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if existing["authorId"] != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the project owner")

    update_data = body.model_dump(exclude_none=True)
    data = project_service.update_project(db, project_id, update_data)
    return _dict_to_response(data)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    username: str = current_user.get("sub", "")
    user = auth_service.get_user_by_username(db, username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    existing = project_service.get_project(db, project_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if existing["authorId"] != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the project owner")

    project_service.delete_project(db, project_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
