export interface UserCreateModel {
	FirstName: string;
	LastName: string;
	Phone: string;
	Email: string;
	Role: string;
	Password: string;
	CountryCode?: string;
	SelectedUserRoleId: string;
}

export interface UserUpdateModel {
	FirstName: string;
	LastName: string;
	Phone: string;
	Email: string;
	Role: string;
	CountryCode?: string;
	SelectedUserRoleId: string;

}

export interface ChangePasswordModel {
	OldPassword: string;
	NewPassword: string;
	ConfirmNewPassword: string;
}