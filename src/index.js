import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import Login from './login';
import Budget from './budget';
import Expenses from './expenses';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

class Controller {
	constructor() {
		this.login = new Login(this);
		this.budget = new Budget(this);
		this.expenses = new Expenses(this, this.budget);

		$(document).ready(() => {
			$('#navbarSupportedContent a').click((e) => {
				e.preventDefault();
				let $link = $(e.currentTarget);
				this.navigateTo($link);
				return false;
			});
		});

		this.login.authenticateUser().then((result) => {
			if (result) {
				//Logged In
				this.navigateTo('budget');
			} else {
				//Not Logged In
				this.navigateTo('login');
			}
		});
	}

	handleLogIn() {
		this.navigateTo('budget');
	}

	handleLogOut() {
		this.navigateTo('login');
	}

	navigateTo(linkOrPage) {
		let $link = (typeof linkOrPage === 'string') ? $(`a[href="#${linkOrPage}"]`) : linkOrPage;
		$('#navbarSupportedContent').collapse('hide');
		$('#navbarSupportedContent a.active').removeClass('active');
		$link.addClass('active');
		switch ($link.attr('href')) {
			case '#budget':
				$('#navbarSupportedContent ul').show();
				this.budget.renderPage();
				break;
			case '#expenses':
				$('#navbarSupportedContent ul').show();
				this.expenses.renderPage();
				break;
			case '#login':
				$('#navbarSupportedContent ul').hide();
				this.login.renderPage();
				break;
		}
	}
}

new Controller();