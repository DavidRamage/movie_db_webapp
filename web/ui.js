//set vars outside of callback scope
var id_token = null;
var movies = null;
var formats = null;
var apiUrl = 'https://bxyfauhz4j.execute-api.us-west-2.amazonaws.com/Dev';
function set_id_token(new_id_token) {
	id_token = new_id_token;
}
function set_movies(movies_in) {
	movies = movies_in;
}
function set_formats(formats_in) {
	formats = formats_in;
}

function create_movie(new_movie_payload) {
	$.ajax({
		type: 'POST',
		url: apiUrl,
		responseType: 'application/json',
		contentType: 'application/json',
		data: JSON.stringify(new_movie_payload),
		headers: {"Authorization" : id_token},
		success: function(data) {
			get_movies();
		},
		error: function(data) {
			console.log("failed to create new movie");
			$("#c_logonform").dialog("open");
			console.log(data);
		}
	});
}

function new_movie_openform() {
	var form_html = '<label for = "name">Movie Name:</label>';
	form_html += '<input type="text" name="name" id="name">' + "<br>\n";
	form_html += '<label for = "length">Length:</label>';
	form_html += '<input type="text" name="length" id="length">' + "<br>\n";
	form_html += '<label for = "year">Year</label>';
	form_html += '<input type="text" name="year" id="year">' + "<br>\n";
	form_html += '<label for = "rating">Rating:</label>';
	form_html += '<input type = "text" name="rating" id="rating">' + "<br>\n";
	form_html += '<label for = "format">Format:</label>';
	form_html += '<select name="format_id" label="format">' + "<br>\n";
	for (var format of formats) {
		form_html += '<option value = "' + format.id + '">' + format.format + '</option>' + "\n";
	}
	form_html += "</select>\n";
        form_html += '<input type="submit" value="Create Movie">';
	$("#newmovieform").html(form_html);
	$("#c_newmovie").dialog({
		dialogClass: "no-close"
	});
	$("#c_newmovie").dialog("open");
	$("#newmovieform").submit(function(event) {
		event.preventDefault();
		var new_movie_payload = {
			name: $("#newmovieform").serializeArray()[0].value,
			length: $("#newmovieform").serializeArray()[1].value,
			year: $("#newmovieform").serializeArray()[2].value,
			rating: $("#newmovieform").serializeArray()[3].value,
			format_id: $("#newmovieform").serializeArray()[4].value
		};
		$("#c_newmovie").dialog("close");
		create_movie(new_movie_payload);
	});
}

function delete_movie(movie_id) {
	$.ajax({
		type: 'DELETE',
		url: apiUrl + '/movie/' + movie_id + '/',
		headers: {"Authorization" : id_token},
		success: function(data) {
			get_movies()
		},
		error: function(data) {
			console.log(data);
			get_movies();
		}
	});
}

function draw_movie_table(movies) {
	var table_html = '<table id ="movietable" class = "ui-widget">' + "\n";
	table_html += '<thead class = "ui-widget-header">' + "\n";
	table_html += '<tr><th>Movie Name</th><th>Length</th><th>Year</th><th>Rating</th><th>Format</th><th>Delete Movie</th></tr>' + "\n";
	table_html += "</thead>\n";
	table_html += '<tbody class = "ui-widget-content">' + "\n";
	for (var movie of movies) {
		table_html += '<tr><td>' + movie.name + '</td><td>' + movie.length + '</td><td>' + movie.year + '</td>';
		table_html += '<td>' + movie.rating + '</td><td>' + movie.format + '</td>';
		table_html += '<td><button id = "movie_' + movie.id + '" class="moviedelete">Delete</button></td></tr>' + "\n";
	}
	table_html += "</tbody>\n</table>\n"
	table_html += '<button id ="newmovie" type="button" class="ui-button">Add Movie</button>' + "\n";
	$("#movietable").html(table_html);
	$("#newmovie").click(function(event) {
		console.log("new movie button fires");
		new_movie_openform();
	});
	$(".moviedelete").on('click', function(event) {
		delete_movie(event.target.id.split('_')[1]);
	});

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


//pull down formats from API
function get_formats() {
	$.ajax({
		type: 'GET',
		url: apiUrl + '/formats',
		responseType: 'application/json',
		dataType: 'json',
		headers: {"Authorization" : id_token},
		success: function(data) {
			set_formats(JSON.parse(data.body));
		},
		error: function(data) {
			console.log("failed to download format data");
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
	$("c_logonform").dialog("open");
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
				get_formats();
				get_movies();
			},
			onFailure : function(error) {
				console.log("failed to log in");
				console.log(JSON.stringify(error));
				$("#c_logonform").dialog("open");
			}
		})
	});
});
