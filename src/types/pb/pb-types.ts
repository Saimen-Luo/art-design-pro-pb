
/**
 * This file was @generated using typed-pocketbase
 */

// https://pocketbase.io/docs/collections/#base-collection
export interface BaseCollectionResponse {
	/**
	 * 15 characters string to store as record ID.
	 */
	id: string;
	/**
	 * Date string representation for the creation date.
	 */
	created: string;
	/**
	 * Date string representation for the creation date.
	 */
	updated: string;
	/**
	 * The collection id.
	 */
	collectionId: string;
	/**
	 * The collection name.
	 */
	collectionName: string;
}

// https://pocketbase.io/docs/api-records/#create-record
export interface BaseCollectionCreate {
	/**
	 * 15 characters string to store as record ID.
	 * If not set, it will be auto generated.
	 */
	id?: string;
}

// https://pocketbase.io/docs/api-records/#update-record
export interface BaseCollectionUpdate {}

// https://pocketbase.io/docs/collections/#auth-collection
export interface AuthCollectionResponse extends BaseCollectionResponse {
	/**
	 * The username of the auth record.
	 */
	username: string;
	/**
	 * Auth record email address.
	 */
	email: string;
	/**
	 * Auth record email address.
	 */
	tokenKey?: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility: boolean;
	/**
	 * Indicates whether the auth record is verified or not.
	 */
	verified: boolean;
}

// https://pocketbase.io/docs/api-records/#create-record
export interface AuthCollectionCreate extends BaseCollectionCreate {
	/**
	 * The username of the auth record.
	 * If not set, it will be auto generated.
	 */
	username?: string;
	/**
	 * Auth record email address.
	 */
	email?: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility?: boolean;
	/**
	 * Auth record password.
	 */
	password: string;
	/**
	 * Auth record password confirmation.
	 */
	passwordConfirm: string;
	/**
	 * Indicates whether the auth record is verified or not.
	 * This field can be set only by admins or auth records with "Manage" access.
	 */
	verified?: boolean;
}

// https://pocketbase.io/docs/api-records/#update-record
export interface AuthCollectionUpdate {
	/**
	 * The username of the auth record.
	 */
	username?: string;
	/**
	 * The auth record email address.
	 * This field can be updated only by admins or auth records with "Manage" access.
	 * Regular accounts can update their email by calling "Request email change".
	 */
	email?: string;
	/**
	 * Whether to show/hide the auth record email when fetching the record data.
	 */
	emailVisibility?: boolean;
	/**
	 * Old auth record password.
	 * This field is required only when changing the record password. Admins and auth records with "Manage" access can skip this field.
	 */
	oldPassword?: string;
	/**
	 * New auth record password.
	 */
	password?: string;
	/**
	 * New auth record password confirmation.
	 */
	passwordConfirm?: string;
	/**
	 * Indicates whether the auth record is verified or not.
	 * This field can be set only by admins or auth records with "Manage" access.
	 */
	verified?: boolean;
}

// https://pocketbase.io/docs/collections/#view-collection
export interface ViewCollectionRecord {
	id: string;
}

// utilities

type MaybeArray<T> = T | T[];

// ===== _mfas =====

export interface MfasResponse extends BaseCollectionResponse {
	collectionName: '_mfas';
	id: string;
	collectionRef: string;
	recordRef: string;
	method: string;
	created: string;
	updated: string;
}

export interface MfasCreate extends BaseCollectionCreate {
	id?: string;
	collectionRef: string;
	recordRef: string;
	method: string;
	created?: string | Date;
	updated?: string | Date;
}

export interface MfasUpdate extends BaseCollectionUpdate {
	id?: string;
	collectionRef?: string;
	recordRef?: string;
	method?: string;
	created?: string | Date;
	updated?: string | Date;
}

export interface MfasCollection {
	type: 'base';
	collectionId: string;
	collectionName: '_mfas';
	response: MfasResponse;
	create: MfasCreate;
	update: MfasUpdate;
	relations: Record<string, never>;
}

// ===== _otps =====

export interface OtpsResponse extends BaseCollectionResponse {
	collectionName: '_otps';
	id: string;
	collectionRef: string;
	recordRef: string;
	created: string;
	updated: string;
}

export interface OtpsCreate extends BaseCollectionCreate {
	id?: string;
	collectionRef: string;
	recordRef: string;
	created?: string | Date;
	updated?: string | Date;
}

export interface OtpsUpdate extends BaseCollectionUpdate {
	id?: string;
	collectionRef?: string;
	recordRef?: string;
	created?: string | Date;
	updated?: string | Date;
}

export interface OtpsCollection {
	type: 'base';
	collectionId: string;
	collectionName: '_otps';
	response: OtpsResponse;
	create: OtpsCreate;
	update: OtpsUpdate;
	relations: Record<string, never>;
}

// ===== _externalAuths =====

export interface ExternalAuthsResponse extends BaseCollectionResponse {
	collectionName: '_externalAuths';
	id: string;
	collectionRef: string;
	recordRef: string;
	provider: string;
	providerId: string;
	created: string;
	updated: string;
}

export interface ExternalAuthsCreate extends BaseCollectionCreate {
	id?: string;
	collectionRef: string;
	recordRef: string;
	provider: string;
	providerId: string;
	created?: string | Date;
	updated?: string | Date;
}

export interface ExternalAuthsUpdate extends BaseCollectionUpdate {
	id?: string;
	collectionRef?: string;
	recordRef?: string;
	provider?: string;
	providerId?: string;
	created?: string | Date;
	updated?: string | Date;
}

export interface ExternalAuthsCollection {
	type: 'base';
	collectionId: string;
	collectionName: '_externalAuths';
	response: ExternalAuthsResponse;
	create: ExternalAuthsCreate;
	update: ExternalAuthsUpdate;
	relations: Record<string, never>;
}

// ===== _authOrigins =====

export interface AuthOriginsResponse extends BaseCollectionResponse {
	collectionName: '_authOrigins';
	id: string;
	collectionRef: string;
	recordRef: string;
	fingerprint: string;
	created: string;
	updated: string;
}

export interface AuthOriginsCreate extends BaseCollectionCreate {
	id?: string;
	collectionRef: string;
	recordRef: string;
	fingerprint: string;
	created?: string | Date;
	updated?: string | Date;
}

export interface AuthOriginsUpdate extends BaseCollectionUpdate {
	id?: string;
	collectionRef?: string;
	recordRef?: string;
	fingerprint?: string;
	created?: string | Date;
	updated?: string | Date;
}

export interface AuthOriginsCollection {
	type: 'base';
	collectionId: string;
	collectionName: '_authOrigins';
	response: AuthOriginsResponse;
	create: AuthOriginsCreate;
	update: AuthOriginsUpdate;
	relations: Record<string, never>;
}

// ===== _superusers =====

export interface SuperusersResponse extends AuthCollectionResponse {
	collectionName: '_superusers';
	id: string;
	tokenKey: string;
	email: string;
	emailVisibility: boolean;
	verified: boolean;
	created: string;
	updated: string;
}

export interface SuperusersCreate extends AuthCollectionCreate {
	id?: string;
	email: string;
	emailVisibility?: boolean;
	verified?: boolean;
	created?: string | Date;
	updated?: string | Date;
}

export interface SuperusersUpdate extends AuthCollectionUpdate {
	id?: string;
	email?: string;
	emailVisibility?: boolean;
	verified?: boolean;
	created?: string | Date;
	updated?: string | Date;
}

export interface SuperusersCollection {
	type: 'auth';
	collectionId: string;
	collectionName: '_superusers';
	response: SuperusersResponse;
	create: SuperusersCreate;
	update: SuperusersUpdate;
	relations: Record<string, never>;
}

// ===== users =====

export interface UsersResponse extends AuthCollectionResponse {
	collectionName: 'users';
	id: string;
	tokenKey: string;
	email: string;
	emailVisibility: boolean;
	verified: boolean;
	name: string;
	nickname: string;
	avatar: string;
	phone: string;
	gender: '' | 'male' | 'female';
	roles: Array<string>;
	created: string;
	updated: string;
}

export interface UsersCreate extends AuthCollectionCreate {
	id?: string;
	email?: string;
	emailVisibility?: boolean;
	verified?: boolean;
	name: string;
	nickname?: string;
	avatar?: File | null;
	phone?: string;
	gender?: '' | 'male' | 'female';
	roles: MaybeArray<string>;
	created?: string | Date;
	updated?: string | Date;
}

export interface UsersUpdate extends AuthCollectionUpdate {
	id?: string;
	email?: string;
	emailVisibility?: boolean;
	verified?: boolean;
	name?: string;
	nickname?: string;
	avatar?: File | null;
	phone?: string;
	gender?: '' | 'male' | 'female';
	roles?: MaybeArray<string>;
	'roles+'?: MaybeArray<string>;
	'roles-'?: MaybeArray<string>;
	created?: string | Date;
	updated?: string | Date;
}

export interface UsersCollection {
	type: 'auth';
	collectionId: string;
	collectionName: 'users';
	response: UsersResponse;
	create: UsersCreate;
	update: UsersUpdate;
	relations: {
		roles: RolesCollection[];
	};
}

// ===== menus =====

export interface MenusResponse extends BaseCollectionResponse {
	collectionName: 'menus';
	id: string;
	pid: string;
	type: 'menu' | 'button';
	sort: number;
	path: string;
	name: string;
	component: string;
	meta_title: string;
	meta_icon: string;
	meta_showBadge: boolean;
	meta_showTextBadge: string;
	meta_isHide: boolean;
	meta_isHideTab: boolean;
	meta_link: string;
	meta_isIframe: boolean;
	meta_keepAlive: boolean;
	meta_fixedTab: boolean;
	meta_isFullPage: boolean;
	meta_activePath: string;
	created: string;
	updated: string;
}

export interface MenusCreate extends BaseCollectionCreate {
	id?: string;
	pid?: string;
	type: 'menu' | 'button';
	sort: number;
	path?: string;
	name: string;
	component?: string;
	meta_title: string;
	meta_icon?: string;
	meta_showBadge?: boolean;
	meta_showTextBadge?: string;
	meta_isHide?: boolean;
	meta_isHideTab?: boolean;
	meta_link?: string;
	meta_isIframe?: boolean;
	meta_keepAlive?: boolean;
	meta_fixedTab?: boolean;
	meta_isFullPage?: boolean;
	meta_activePath?: string;
	created?: string | Date;
	updated?: string | Date;
}

export interface MenusUpdate extends BaseCollectionUpdate {
	id?: string;
	pid?: string;
	type?: 'menu' | 'button';
	sort?: number;
	'sort+'?: number;
	'sort-'?: number;
	path?: string;
	name?: string;
	component?: string;
	meta_title?: string;
	meta_icon?: string;
	meta_showBadge?: boolean;
	meta_showTextBadge?: string;
	meta_isHide?: boolean;
	meta_isHideTab?: boolean;
	meta_link?: string;
	meta_isIframe?: boolean;
	meta_keepAlive?: boolean;
	meta_fixedTab?: boolean;
	meta_isFullPage?: boolean;
	meta_activePath?: string;
	created?: string | Date;
	updated?: string | Date;
}

export interface MenusCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'menus';
	response: MenusResponse;
	create: MenusCreate;
	update: MenusUpdate;
	relations: {
		pid: MenusCollection;
		menus_via_pid: MenusCollection[];
		roles_via_menus: RolesCollection[];
	};
}

// ===== roles =====

export interface RolesResponse extends BaseCollectionResponse {
	collectionName: 'roles';
	id: string;
	name: string;
	desc: string;
	menus: Array<string>;
	created: string;
	updated: string;
}

export interface RolesCreate extends BaseCollectionCreate {
	id?: string;
	name: string;
	desc: string;
	menus?: MaybeArray<string>;
	created?: string | Date;
	updated?: string | Date;
}

export interface RolesUpdate extends BaseCollectionUpdate {
	id?: string;
	name?: string;
	desc?: string;
	menus?: MaybeArray<string>;
	'menus+'?: MaybeArray<string>;
	'menus-'?: MaybeArray<string>;
	created?: string | Date;
	updated?: string | Date;
}

export interface RolesCollection {
	type: 'base';
	collectionId: string;
	collectionName: 'roles';
	response: RolesResponse;
	create: RolesCreate;
	update: RolesUpdate;
	relations: {
		users_via_roles: UsersCollection[];
		menus: MenusCollection[];
	};
}

// ===== Schema =====

export type Schema = {
	_mfas: MfasCollection;
	_otps: OtpsCollection;
	_externalAuths: ExternalAuthsCollection;
	_authOrigins: AuthOriginsCollection;
	_superusers: SuperusersCollection;
	users: UsersCollection;
	menus: MenusCollection;
	roles: RolesCollection;
};