import { Auth } from 'aws-amplify';
import $ from 'jquery';
import loginPage from './templates/login/login.pug';

export default class Login {
	constructor(controller) {
		this.controller = controller;
		/*
		Auth.signUp({
			username: 'SPGWhistler',
			password: 'S2vannah',
			attributes: {
				email: 'SPGWhistler@gmail.com'
			},
			validationData: []  //optional
		})
			.then(data => console.log(data))
			.catch(err => console.log(err));
		*/
		/*
		Auth.confirmSignUp('SPGWhistler', '880213', {
		}).then(data => console.log(data))
		  .catch(err => console.log(err));
		  */
		 /*
		Auth.signIn({
			username: 'SPGWhistler', // Required, the username
			password: 'S2vannah' // Optional, the password
		}).then(user => console.log(user))
		.catch(err => console.log(err));
		*/
	}

	async authenticateUser() {
		try {
			return await Auth.currentAuthenticatedUser();
		} catch (e) {
			return false;
		}
	}

	renderPage() {
		try {
			Auth.signOut();
		} catch (e) {}
		$(document).ready(() => {
			/*
			$('#signoutButton').click(async () => {
				try {
					await Auth.signOut();
					this.renderPage();
					$('.navbar-collapse').collapse('hide');
				} catch (e) {
					console.log('could not signout', e);
				}
			});
			*/
			$('#pageContent').html(loginPage);
			$('body').show();
			$('#loginForm').submit((e) => {
				e.preventDefault;
				this.tryLogin($('#userInput').val(), $('#passwordInput').val());
				return false;
			});
		});
	}

	async tryLogin(username, password) {
		try {
			let user = await Auth.signIn({ username, password });
			if (user.challengeName === 'SMS_MFA' || user.challengeName === 'SOFTWARE_TOKEN_MFA') {
				console.log('unsupported login method', user);

				/*
				// You need to get the code from the UI inputs
				// and then trigger the following function with a button click
				const code = getCodeFromUserInput();
				// If MFA is enabled, sign-in should be confirmed with the confirmation code
				const loggedUser = await Auth.confirmSignIn(
					user,   // Return object from Auth.signIn()
					code,   // Confirmation code  
					mfaType // MFA Type e.g. SMS_MFA, SOFTWARE_TOKEN_MFA
				);
				*/
			} else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
				console.log('unsupported login method', user);

				/*
				const { requiredAttributes } = user.challengeParam; // the array of required attributes, e.g ['email', 'phone_number']
				// You need to get the new password and required attributes from the UI inputs
				// and then trigger the following function with a button click
				// For example, the email and phone_number are required attributes
				const { username, email, phone_number } = getInfoFromUserInput();
				const loggedUser = await Auth.completeNewPassword(
					user,               // the Cognito User Object
					newPassword,       // the new password
					// OPTIONAL, the required attributes
					{
						email,
						phone_number,
					}
				);
				*/
			} else if (user.challengeName === 'MFA_SETUP') {
				console.log('unsupported login method', user);

				// This happens when the MFA method is TOTP
				// The user needs to setup the TOTP before using it
				// More info please check the Enabling MFA part
				//Auth.setupTOTP(user);
			} else {
				// The user directly signs in
				//console.log('user logged in', user);
				this.controller.handleLogIn();
			}
		} catch (err) {
			if (err.code === 'UserNotConfirmedException') {
				// The error happens if the user didn't finish the confirmation step when signing up
				// In this case you need to resend the code and confirm the user
				// About how to resend the code and confirm the user, please check the signUp part
				alert('your account is not confirmed');
			} else if (err.code === 'PasswordResetRequiredException') {
				// The error happens when the password is reset in the Cognito console
				// In this case you need to call forgotPassword to reset the password
				// Please check the Forgot Password part.
				alert('you need to reset your password');
			} else if (err.code === 'NotAuthorizedException') {
				// The error happens when the incorrect password is provided
				alert('wrong user or password');
			} else if (err.code === 'UserNotFoundException') {
				// The error happens when the supplied username/email does not exist in the Cognito user pool
				alert('wrong user or password');
			} else {
				console.log(err);
			}
		}
	}
}