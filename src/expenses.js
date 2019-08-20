import $ from 'jquery';
import expensesPage from './templates/expenses/expenses.pug';

export default class Expenses {
	constructor(controller, budget) {
		this.controller = controller;
		this.budget = budget;
	}

	renderPage() {
		$(document).ready(() => {
			$('#pageContent').html(expensesPage);
			$('body').show();
		});
		this.renderExpensesTable();
	}

	renderExpensesTable() {
		$('#expensesTable').empty();
		let today = this.budget.getFormattedDate();
		let expenses = this.budget.getExpenses();
		if (expenses[today] && expenses[today].length) {
			expenses[today].forEach((expense, i) => {
				let amount = parseFloat(Math.round(expense.amount * 100) / 100).toFixed(2);
				$('#expensesTable').append(`
				<tr data-index="${i}">
					<td>$${amount}</td>
					<td>${expense.category}</td>
				</tr>
				`);
			});
			$('#expensesTable tr').click((e) => {
				let index = $(e.currentTarget).data('index');
				this.renderDeleteExpenseModal(index);
			});
		}
	}

	renderDeleteExpenseModal(index, date) {
		let fdate = (date) ? this.budget.getFormattedDate(date) : this.budget.getFormattedDate();
		let expenses = this.budget.getExpenses();
		if (expenses[fdate] && expenses[fdate].length && expenses[fdate][index]) {
			let amount = parseFloat(Math.round(expenses[fdate][index].amount * 100) / 100).toFixed(2);
			$('#deleteExpenseModal div.modal-body').empty().append(`
				${amount} ${expenses[fdate][index].category}
			`);
			$('#deleteExpenseConfirm').off();
			$('#deleteExpenseConfirm').click((e) => {
				expenses[fdate].splice(index, 1);
				this.budget.setExpenses(expenses);
				this.renderExpensesTable();
				$('#deleteExpenseModal').modal('hide');
				$('#deleteExpenseConfirm').off();
			});
			$('#deleteExpenseModal').modal('show');
		}
	}
}