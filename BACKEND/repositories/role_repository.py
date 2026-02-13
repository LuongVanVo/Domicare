from typing import Optional, List
from models.role import Role

class RoleRepository:
    """Repository for Role database operations."""
    @staticmethod
    def find_by_name(name: str) -> Optional[Role]:
        """Find role by name"""
        try:
            return Role.objects.get(name=name)
        except Role.DoesNotExist:
            return None

    @staticmethod
    def find_by_id(role_id: int) -> Optional[Role]:
        """Find role by ID"""
        try:
            return Role.objects.get(id=role_id)
        except Role.DoesNotExist:
            return None

    @staticmethod
    def find_all() -> List[Role]:
        """Get all roles"""
        return list(Role.objects.all())

    @staticmethod
    def save(role: Role) -> Role:
        """Save role to database"""
        role.save()
        return role