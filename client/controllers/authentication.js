var errorObjectHandler = function(error) {
	switch(error.error) { // User not found or incorrect password
		case 403:
			switch (error.reason) {
				case 'Email already exists.':
					return 'Email already exists.';
				default:
					return 'Incorrect email or password.';
			}
		default:
			return 'Unknown error.';
	}
}

var authErrorHandler = function(error, target) {
	var errorMessage;
	switch (error) {
		case 'blank':
			errorMessage = 'You cannot leave any mandatory field blank.';
			break;
		case 'invalid email':
			errorMessage = 'Invalid email format.';
			break;
		case 'password unmatched':
			errorMessage = 'Password unmatched.';
			break;
		default: // error object returned
			errorMessage = errorObjectHandler(error);
	}
	$('#' + target + '-error').text(errorMessage);
}

checkAuthError = function(authData, target, method) {
	var blankError = false;
	var blankInput = [];
	$.each(authData, function(key, value) {
		if (value == '') {
			blankInput.push(key);
			blankError = true;
		}
	});

	if (target == 'profile' && blankInput.toString() == '1,2') {
		blankError = false;
	}

	// authData = [<email>, <password>, <repassword>, <else>...]
	if (blankError) {
		authErrorHandler('blank', target);
	} else if (authData[0].indexOf('@') == -1 || authData[0].indexOf('.') == -1) {
		authErrorHandler('invalid email', target);
	} else if (authData[1] != authData[2] && authData[2] != undefined) {
		authErrorHandler('password unmatched', target);
	} else {
		method();
	}
}

login = function() {
	var email = $('#login-email').val();
	var password  =$('#login-password').val();

	checkAuthError([email, password], 'login', function() {
		Meteor.loginWithPassword(email, password, function(err) {
			if (err) {
				authErrorHandler(err, 'login');
			} else {
				Router.go('/');
			}
		});
	});

}

register = function() {
	var firstname = $('#reg-firstname').val();
	var lastname = $('#reg-lastname').val();
	var email = $('#reg-email').val();
	var password = $('#reg-password').val();
	var rePassword = $('#reg-repassword').val();

	checkAuthError([email, password, rePassword, firstname, lastname], 'register', function() {
		Accounts.createUser({
			email: email,
			password: password,
			profile: {
				firstname: firstname,
				lastname: lastname,
				friends: []
			},
			notifications: []
		}, function(err) {
			if (err) {
				authErrorHandler(err, 'register');
			} else {
				Router.go('/');
			}
		});
	});
}

logout = function() {
	Meteor.logout(function(err) {
		if (err) {
			throw new Meteor.Error('Logout failed');
		} else {
			Router.go('/home');
		}
	});
}