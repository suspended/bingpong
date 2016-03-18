bp.accountManager = (function () { 
	var REDEEMABLE_COLOR = "#00F00";
	var NOT_REDEEMABLE_COLOR = "#FAFAFA";
	var BLOCKED_COLOR = "#FFFF00";
	var BANNED_COLOR = "#FF0000";
	
	var _accounts = [];
	var _accountsChecked = [];
	var _globalAccountCheckmarkChecked = true;
	
	var accountManager = {};
	
	function _getAccountIndex(account) { 
		for (var i = 0; i < _accounts.length; i++) { 
			if (_accounts[i].getUsername() === account.getUsername()) { 
				return i;
			}
		}
		
		return -1;
	}
	
	accountManager.init = function () { 
		if (bp.cookies.get("accountCount") && bp.cookies.get("accountCount") !== "0") { // there are accounts stored in cookies
			// loop through all the accounts stored
			for (var i = 1; i <= bp.cookies.get("accountCount"); i++) { 
				// get the account's information from cookies
				var username = bp.cookies.get("username" + i);
				var password = bp.cookies.get("password" + i);
				var creditCount = bp.cookies.get("credits" + i);
				
				// add the account to the account manager
				var account = new bp.Account(username, password);
				accountManager.addAccount(account);
				account.setCreditCount(creditCount);	
			}
			
			// update the account manager display
			accountManager.updateDisplay(false);
		}
	}
	
	accountManager.updateDisplay = function (disableChanges) {
		document.getElementById('accountManager').innerHTML = "<table class=\"optionsTable\"><tr class=\"optionsTable\"><td class=\"optionsTable\"><!--<select disabled><option>Main account group</option></select><span style=\"float: right\">This group's last run time: <b>N/A</b></span>--></td><tr class=\"optionsTable\"><td class=\"optionsTable\"><table id=\"accountsTable\"></table></td></tr></table>";
		
		// get and add all accounts stored in cookies
		if (bp.cookies.get("accountCount") && bp.cookies.get("accountCount") !== "0") { // there are accounts stored in cookies
			_globalAccountCheckmarkChecked = (!bp.cookies.get("globalAccountCheckmarkChecked") || bp.cookies.get("globalAccountCheckmarkChecked") === "true");
			
			// insert header
			var accountsTable = document.getElementById('accountsTable');
			var headerRow = accountsTable.insertRow(-1);
			var cmHeaderCell = headerRow.insertCell(0);
			var dsHeaderCell = headerRow.insertCell(1);
			var msHeaderCell = headerRow.insertCell(2);
			var dtHeaderCell = headerRow.insertCell(3);
			var usernameHeaderCell = headerRow.insertCell(4);
			var creditsHeaderCell = headerRow.insertCell(5);
			var optionsHeaderCell = headerRow.insertCell(6);
			
			cmHeaderCell.innerHTML = "<center><input type=checkbox id=\"globalCheckmark\"  " + (_globalAccountCheckmarkChecked ? "checked" : "") + " " + (disableChanges ? "disabled" : "") + " onclick=\"bp.accountManager.onGlobalCheckmarkChange();\"></center>";
			dsHeaderCell.innerHTML = "<center><i class=\"fa fa-laptop fa-lg\"></i></center>";
			msHeaderCell.innerHTML = "<center><i class=\"fa fa-mobile fa-lg\"></i></center>";
			dtHeaderCell.innerHTML = "<center><i class=\"fa fa-flag fa-lg\"></i></center>";
			usernameHeaderCell.innerHTML = "<center><b>Usernames</b></center>";
			creditsHeaderCell.innerHTML = "<center><b>Credits</b></center>";
			optionsHeaderCell.innerHTML = "<center><b>Options</b></center>";
			
			// loop through the accounts stored
			for (var i = 1; i <= bp.cookies.get("accountCount"); i++) { 
				// get the account's information from cookies
				var username = bp.cookies.get("username" + i);
				var password = bp.cookies.get("password" + i);
				var creditCount = bp.cookies.get("credits" + i);
				var isEnabled = bp.cookies.get("isEnabled" + i);
				
				// sanitize the credit count and account enable/disable status
				creditCount = (creditCount && creditCount >= 0) ? creditCount : "N/A";
				isEnabled = (!isEnabled || isEnabled === "true");

				// populate the rows
				var row = accountsTable.insertRow(-1);
				var checkmarkCell = row.insertCell(0);
				var dsStatusCell = row.insertCell(1);
				var msStatusCell = row.insertCell(2);
				var dtStatusCell = row.insertCell(3);
				var usernameCell = row.insertCell(4);
				var creditsCell = row.insertCell(5);
				var optionsCell = row.insertCell(6);

				checkmarkCell.innerHTML = "<center><input type=checkbox id=\"check" + i + "\" " + (isEnabled ? "checked" : "") + " " + (disableChanges ? "disabled" : "") + " onclick=\"onAccountCheckmarksChange();\"></center>";
				dsStatusCell.innerHTML = "<center><span id=\"status" + i + "\"><img src=\"../blue10.png\" width=\"10\" height=\"10\"></img></span></center>";
				msStatusCell.innerHTML = "<center><span id=\"status_ms" + i + "\"><img src=\"../blue10.png\" width=\"10\" height=\"10\"></img></span></center>";
				dtStatusCell.innerHTML = "<center><span id=\"status_dt" + i + "\"><img src=\"../blue10.png\" width=\"10\" height=\"10\"></img></span></center>";
				usernameCell.innerHTML = "<span id=\"accountName" + i + "\">" + username + "</span>&nbsp;&nbsp;&nbsp;";
				creditsCell.innerHTML = "<center><span id=\"credits" + i + "\">" + creditCount + "</span></center>";
				optionsCell.innerHTML = "<a href=\"#\" onclick=\"launchDashboardForAccount(" + i + ");return false;\">Dashboard</a>&nbsp;&nbsp;&nbsp;<a href=\"#\" onclick=\"launchEmailForAccount(" + i + ");return false;\">Outlook</a>&nbsp;&nbsp;&nbsp;<a href=\"#\" onclick=\"removeAccount(" + i + ");return false;\">Remove</a>";
			}
		}
	}
	
	accountManager.getAccountIndex = function (account) { 
		return _getAccountIndex(account); // debugging
	}
	
	accountManager.getAccountAtIndex = function (index) { 
		return _accounts[index];
	}

	accountManager.addAccount = function (account) { 
		// add account to list
		_accounts.push(account);
		
		// update the cookies to reflect the new account
		var newAccountCount = _accounts.length;
		bp.cookies.set("username" + newAccountCount, account.getUsername());
		bp.cookies.set("password" + newAccountCount, account.getPassword());
		bp.cookies.set("accountCount", newAccountCount);
		
		// update the account manager display
		accountManager.updateDisplay(false);
	}
	
	accountManager.removeAccount = function (account) {
		// remove account from list
		_accounts.splice(_getAccountIndex(account), 1);
		
		// delete the corresponding cookies
		bp.cookies.remove("username" + accountIndex);
		bp.cookies.remove("password" + accountIndex);
		bp.cookies.remove("credits" + accountIndex);
		bp.cookies.remove("isRedeemable" + accountIndex);

		// remove account entry #accountIndex from the arrays
		_accounts.splice(_getAccountIndex(account), 1);

		// update the new account count
		bp.cookies.set("accountCount", _accounts.length);

		// shift all accounts > accountIndex down to "fill the gap"
		for (var i = 1; i <= accountCount; i++) {
			bp.cookies.set("username" + i, _account[i].getUsername());
			bp.cookies.set("password" + i, _account[i].getPassword());
			bp.cookies.set("credits" + i, _account[i].getCreditCount());
		}

		// delete the cookie corresponding to the (accountCount + 1)th account
		bp.cookies.remove("username" + (_accounts.length + 1));
		bp.cookies.remove("password" + (_accounts.length + 1));
		bp.cookies.remove("credits" + (_accounts.length + 1));
		bp.cookies.remove("isRedeemable" + (_accounts.length + 1));

		// update the account manager display
		accountManager.updateDisplay(false);
	}
	
	accountManager.updateAccountWithDashboardData = function (account) { 
		var index = _getAccountIndex(account);
		var dashboardData = bp.rewardsDashboard.getDashboardData();
		var newCreditCount = dashboardData.match(/(?:<span class="credits-left"><div class="credits" title=")(\d+)(?:">)/)[1];
		var isRedeemable = (data.indexOf("<div class=\"progress-percentage\">100%") == -1);
		
		// update the account with the new data
		account.setCreditCount(newCreditCount);
		account.setRedeemabilityStatus(isRedeemable);
		
		// update the display
		document.getElementById('credits' + index).innerHTML = account.getCreditCount();
		document.getElementById('credits' + index).style.color = (isRedeemable ? REDEEMABLE_COLOR : NOT_REDEEMABLE_COLOR);
		document.getElementById('accountName' + index).style.color = (isRedeemable ? REDEEMABLE_COLOR : NOT_REDEEMABLE_COLOR);
		
		// update storage
		bp.cookies.set("credits" + index, account.getCreditCount());
		bp.cookies.set("isRedeemable" + index, account.getRedeemablityStatus());
	}
	
	accountManager.markAccountAsBlocked = function (acount) {
		var index = _getAccountIndex(account);
		
		document.getElementById('credits' + index).style.color = BLOCKED_COLOR;
		document.getElementById('accountName' + index).style.color = BLOCKED_COLOR;
		document.getElementById('credits' + index).innerHTML = "BLOCKED";
	}
	
	accountManager.markAccountAsBanned = function (account) {
		var index = _getAccountIndex(account);
		
		// to-do
	}
	
	return accountManager;
})();
		
		