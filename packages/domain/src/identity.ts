declare const accountIdBrand: unique symbol;
declare const personIdBrand: unique symbol;

export type AccountId = string & { readonly [accountIdBrand]: "AccountId" };
export type PersonId = string & { readonly [personIdBrand]: "PersonId" };

function createIdentityId<T extends string>(value: string, label: string): T {
  if (value.length === 0 || value.trim() !== value) {
    throw new TypeError(`${label} must be a non-empty, trimmed string`);
  }

  return value as T;
}

export function createAccountId(value: string): AccountId {
  return createIdentityId<AccountId>(value, "AccountId");
}

export function createPersonId(value: string): PersonId {
  return createIdentityId<PersonId>(value, "PersonId");
}

export type Account = {
  readonly id: AccountId;
  readonly personId: PersonId;
};

export type PersonProfile = {
  readonly displayName: string;
};

export type Person = {
  readonly id: PersonId;
  readonly profile: PersonProfile;
};
