export function setActiveRoles(userRoles) {
  userRoles.forEach((userRoleType) => {
      if (userRoleType.RoleName === 'System admin' || 
          userRoleType.RoleName === 'System user' ||
          userRoleType.RoleName === 'Tenant admin' ||
          userRoleType.RoleName === 'Tenant user' ||
          userRoleType.RoleName === 'Patient' ||
          userRoleType.RoleName === 'Doctor') {
          userRoleType.isActive = true;
      } else {
          userRoleType.isActive = false;
      }
  });
  return userRoles;
}
