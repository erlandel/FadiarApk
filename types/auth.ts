export type Person = {
  id: string;
  name: string;
  lastname1: string;
  lastname2: string;
  ci: string;
  address: string;
  cellphone1: string;
  cellphone2: string | null;
};

export type User = {
  id: string;
  username: string;
  email: string;
  active: boolean;
  img: string | null;
  id_person: string;
  id_type: string;
  id_paquete: string | null;
  referredcode: string;
  registrationid: string | null;
  password?: string;
};

export type UserType = {
  id: string;
  category: number;
  type: string;
};

export type AuthPayload = {
  person: Person;
  user: User;
  type: UserType;
  access_token: string;
  refresh_token: string;
};