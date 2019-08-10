import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';

class Budget {
	constructor() {
		$(document).ready(() => {
			$('body').show();
			$('#dollars').on('keydown', (e) => {
				if (e.code === 'Period') {
					e.preventDefault();
					$('#cents').focus();
					return false;
				}
			});
		});
	}
}

new Budget();