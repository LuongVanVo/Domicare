import logging
from typing import List

from dtos.role_dto import RoleDTO
from exceptions.base import NotFoundException
from models.role import Role
from repositories.role_repository import RoleRepository

logger = logging.getLogger(__name__)
class RoleService:
    def __init__(self):
        self.role_repo = RoleRepository()

    def get_role_by_name(self, name: str) -> Role:
        """Get role entity by name"""
        logger.debug(f"[RoleService] Fetching role by name: {name}")
        role = self.role_repo.find_by_name(name)
        if not role:
            logger.warning(f"[RoleService] Role not found with name: {name}")
            raise NotFoundException(f"[RoleService] Role not found with name: {name}")
        return role

    def get_role_entity_by_id(self, role_id: int) -> Role:
        """Get role entity by ID"""
        logger.debug(f"[RoleService] Fetching role by ID: {role_id}")

        role = self.role_repo.find_by_id(role_id)
        if not role:
            logger.warning(f"[RoleService] Role not found with ID: {role_id}")
            raise NotFoundException(f"[RoleService] Role not found with ID: {role_id}")
        return role

    def get_role_by_id(self, role_id: int) -> RoleDTO:
        """Get role DTO by ID"""
        role = self.get_role_entity_by_id(role_id)
        return RoleDTO(
            id=role.id,
            name=role.name,
            description=role.description,
        )

    def get_all_roles(self) -> List[RoleDTO]:
        """Get all roles"""
        roles = self.role_repo.find_all()
        return [RoleDTO(
            id=role.id,
            name=role.name,
            description=role.description,
        ) for role in roles]