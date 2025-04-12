import RouteButton from "../components/routebutton";

export interface RoleConfig {
  label: string;
  route: string;
}

const roleConfigs: Record<string, RoleConfig> = {
  parent: {
    label: "I'm a Parent!",
    route: "/register/registerParent",
  },
  teacher: {
    label: "I'm a Teacher!",
    route: "/register/registerTeacher",
  },
};

export function generateRoleButtons() {
  return Object.entries(roleConfigs).map(([key, config]) => (
    <RouteButton key={key} title={config.label} to={config.route} />
  ));
}
