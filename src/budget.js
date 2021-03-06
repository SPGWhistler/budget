import $ from 'jquery';
import dateFormat from 'date-fns/format';
import { eachDayOfInterval, lastDayOfMonth, isWeekend, subDays, subMonths, differenceInDays, compareAsc, addDays } from 'date-fns';
import budgetPage from './templates/budget/budget.pug';
import { Storage } from 'aws-amplify';

export default class Budget {
	constructor(controller) {
		this.controller = controller;
		this.expenses = null;
		this.date = null;
		this.config = {
			dailyBudget: 50
		};

		/*
		Storage.put('test.txt', 'Hello')
			.then(result => console.log(result)) // {key: "test.txt"}
			.catch(err => console.log(err));
			*/
	}

	renderPage() {
		$(document).ready(() => {
			$('#pageContent').html(budgetPage);
			$('body').show();
		});
		this.renderBalance();
		this.renderExpenseTypes();
	}

	renderBalance() {
		let rb = this.getRunningBalance();
		rb = parseFloat(Math.round(rb * 100) / 100).toFixed(2);
		let tb = this.getTodaysBalance();
		tb = parseFloat(Math.round(tb * 100) / 100).toFixed(2);
		$('#runningBalance').text(`$${rb}`);
		$('#dailyBalance').text(`$${tb}`);
	}

	renderExpenseTypes() {
		$('#expenseTypes').empty();
		for (const expenseType of this.getExpenseTypes()) {
			$('#expenseTypes').append(`
			<button class="btn btn-success btn-block" type="button">
				${expenseType}
			</button>
			`);
		}
		$('#expenseTypes button').click((e) => {
			let expenseType = $(e.currentTarget).text().trim();
			let dollars = $('#dollars').val();
			if (dollars !== '') {
				let amount = Number(dollars);
				this.saveExpense(amount, expenseType);
				$('#dollars').val('').focus();
			}
		});
	}

	/**
	 * Return the date in the format 20190801.
	 * @param {Date} date
	 */
	getFormattedDate(date = new Date()) {
		return dateFormat(date, 'yyyyMMdd');
	}

	/**
	 * Return the last weekday before the given date,
	 * or before today if date is not specified.
	 * @param {Date} date Optional. A date object.
	 */
	getLastWeekday(date) {
		date = date || new Date();
		return this.getLastWeekdayOfMonth(date);
	}

	/**
	 * Return the last weekday in the current month.
	 * Or, if you specify a specific date, this will return
	 * the last weekday before that date.
	 * @param {Date} date Optional. A date object.
	 */
	getLastWeekdayOfMonth(date) {
		date = date || lastDayOfMonth(new Date());
		if (isWeekend(date)) {
			return this.getLastWeekdayOfMonth(subDays(date, 1));
		}
		return date;
	}

	/**
	 * Figure out the date of the last payday.
	 * This assumes the paydays are on the 15th and last day of each month,
	 * and you are only paid on weekdays.
	 */
	getLastPayday() {
		let today = new Date();
		let fifteenth = new Date(dateFormat(today, 'yyyy'), today.getMonth(), 15);
		let midPayday = this.getLastWeekday(fifteenth);
		let res = compareAsc(today, midPayday);
		let lastPayday;
		if (res === -1) {
			//Before mid payday
			lastPayday = this.getLastWeekdayOfMonth(lastDayOfMonth(subMonths(today, 1)));
		} else {
			//On or after mid payday
			let nextPayday = this.getLastWeekdayOfMonth(today);
			res = compareAsc(today, nextPayday);
			if (res === -1) {
				//Before next payday
				lastPayday = midPayday;
			} else {
				//On or after next payday
				lastPayday = nextPayday;
			}
		}
		return lastPayday;
	}

	getExpenses() {
		if (!this.expenses) {
			if (!localStorage.expenses) {
				localStorage.expenses = JSON.stringify({});
			}
			this.expenses = JSON.parse(localStorage.expenses);
		}
		return this.expenses;
	}

	setExpenses(expenses) {
		this.expenses = expenses;
		localStorage.expenses = JSON.stringify(expenses);
	}

	/**
	 * Save an expense to the expenses.
	 * Format of the expenses data:
		let expenses = {
			'20190810': [
				{
					amount: 6.45,
					category: 'transit'
				}, {
					amount: 10.54,
					category: 'shopping'
				}
			]
		};
	 * @param float amount
	 * @param string category
	 */
	saveExpense(amount, category, date) {
		let expenses = this.getExpenses();
		let fdate = this.getFormattedDate(date) || this.getFormattedDate();
		expenses[fdate] = expenses[fdate] || [];
		expenses[fdate].push({ amount, category });
		this.setExpenses(expenses);
		this.renderBalance();
		this.renderExpensesTable();
	}

	getRunningBalance() {
		let lastPayday = this.getLastPayday();
		let days = eachDayOfInterval({
			start: lastPayday,
			end: new Date()
		});
		let expenses = this.getExpenses();
		let balance = 0;
		for (const day of days) {
			balance += this.config.dailyBudget * 100;
			let d = this.getFormattedDate(day);
			if (expenses[d] && expenses[d].length) {
				for (const expense of expenses[d]) {
					balance = balance - (expense.amount * 100);
				}
			}
		}
		return balance / 100;
	}

	getTodaysBalance() {
		let balance = this.config.dailyBudget * 100;
		let today = this.getFormattedDate();
		let expenses = this.getExpenses();
		if (expenses[today] && expenses[today].length) {
			for (const expense of expenses[today]) {
				balance = balance - (expense.amount * 100);
			}
		}
		return balance / 100;
	}

	getExpenseTypes() {
		if (!this.expenseTypes) {
			if (!localStorage.expenseTypes) {
				localStorage.expenseTypes = JSON.stringify([]);
			}
			this.expenseTypes = JSON.parse(localStorage.expenseTypes);
		}
		return this.expenseTypes;
	}

	setExpenseTypes(expenseTypes) {
		this.expenseTypes = expenseTypes;
		localStorage.expenseTypes = JSON.stringify(expenseTypes);
	}
}