//set Cognito id token outside of scope
var id_token = null;
var movies = null;
var apiUrl = 'https://bxyfauhz4j.execute-api.us-west-2.amazonaws.com/Dev';
function set_id_token(new_id_token) {
	id_token = new_id_token;
}
function set_movies(movies_in) {
	movies = movies_in;
}
function draw_movie_table(movies) {
	console.log(movies);
	var table_html = '<table id ="movietable">' + "\n";
	table_html += '<tr><th>Movie Name</th><th>Length</th><th>Year</th><th>Rating</th><th>Format</th></tr>' + "\n";
	for (var movie of movies) {
		table_html += '<tr><td>' + movie.name + '</td><td>' + movie.length + '</td><td>' + movie.year + '</td>';
		table_html += '<td>' + movie.rating + '</td><td>' + movie.format + '</td></tr>' + "\n";
	}
	table_html += "</table>"
	$("#movietable").html(table_html);
}

//pull down movies from API
function get_movies() {
	$.ajax({
		type: 'GET',
		url: apiUrl,
		responseType: 'application/json',
		dataType: 'json',
		headers: {"Authorization" : id_token},
		success: function(data) {
			console.log("successfully downloaded movie data");
			set_movies(JSON.parse(data.body));
			draw_movie_table(movies);
		},
		error: function(data) {
			console.log("failed to download movie data");
			$("#c_logonform").dialog("open");
			console.log(data);
		}
	});
}

$(document).ready(function() {
	var userPoolId = 'us-west-2_qv86JlrBI';
	var clientId = '17cr8gqsj2fuv2lm091satl88i';
	var poolData = { 'UserPoolId': userPoolId, 'ClientId': clientId }; 
	var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
	$("#c_logonform").dialog({
		dialogClass: "no-close"
	});
	//cognito authentication
	$("#logon").submit(function(event) {
		event.preventDefault();
		$("#c_logonform").dialog("close");
		var authenticationData = {
		 Username : $("#logon").serializeArray()[0].value,
		 Password : $("#logon").serializeArray()[1].value
		};
		var userData = {
			Username : $("#logon").serializeArray()[0].value,
			Pool : userPool
		};
		var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
		var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
		cognitoUser.authenticateUser(authenticationDetails, {
			onSuccess : function(result) {
				var token = result.getIdToken().jwtToken;
				set_id_token(token);
				get_movies();
			},
			onFailure : function(error) {
				console.log("failed to log in");
				console.log(JSON.stringify(error));
				$("#_logonform").show();
			}
		})
	});
});
