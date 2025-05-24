from sqlalchemy.orm import Session
from digame.app.models.tenant import Tenant # Assuming this model exists
from digame.app.models.user import User # Assuming this model exists
# from digame.app.models.tenant_user import TenantUser # If using an association table

def get_tenant_by_id(db: Session, tenant_id: int) -> Tenant | None:
    return db.query(Tenant).filter(Tenant.id == tenant_id).first()

# Add other necessary CRUD functions for tenants as they become clear, e.g.:
# def get_active_tenant_for_user(db: Session, user_id: int) -> Tenant | None:
#   # This would involve querying through TenantUser link or a direct field on User
#   # For now, this is a conceptual placeholder.
#   user = db.query(User).filter(User.id == user_id).first()
#   if user and user.tenants: # Assuming user.tenants is a list of TenantUser links
#       active_tenant_user_link = user.tenants[0] # Simplification: take the first
#       return active_tenant_user_link.tenant
#   return None
