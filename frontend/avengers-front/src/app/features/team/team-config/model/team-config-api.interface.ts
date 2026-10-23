export interface TeamLeader {
  id: string;
  name: string;
  role: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
}

export interface CatalogHero {
  id: string;
  name: string;
  role: string;
}

export interface StrategyOption {
  code: string;
  label: string;
  description: string;
}

export interface TeamConfigData {
  teamId: string;
  strategy: string;
  leader: TeamLeader;
  members: TeamMember[];
  availableCatalog: CatalogHero[];
  strategies: StrategyOption[];
  editability: {
    members: boolean;
    formation: boolean;
    strategy: boolean;
  };
  updatedAt: string;
}