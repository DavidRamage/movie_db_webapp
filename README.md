# Movie Database Application
This is a simple application that allows the user to manage their movie
collection.  Information about the movies themselves is stored in a 
Postgres database and displayed via a Javascript UI.  AWS services are used
extensively throughout.

## Directory Structure
## sql
This contains the SQL script used to create the database

## web
This contains the client-side code used for the application

## lambda
This contains the Lambda functions used by the web services and their
dependencies.  The directory name corresponds to the Lambda name.
### lambda/get_all_movies
This function gets all movies in the db
### lambda/create_movie
This function creates a new movie in the database
### lambda/delete_movie
This function deletes a movie from the database
### lambda/update_movie
This function updates a movie in the database
### lambda/get_formats
This function gets the meda formats used for movies
### Notes on deploying the Lambda functions
#### Required library - psycopg2
Out of the box Lambda does not support the psycopg2 library needed for Python
to connect to Postgres. For convenience purposes I have included the needed
Python and compiled code to allow the functions to run.  When you deploy
the Lambdas, you will need to create a zip file of all the contents of
each directory.  On a Linux machine this is performed by executing:
`zip my_lambda.zip -r *`
#### Network Access Needed
You will need to deploy your Lambda functions in a VPC so that they can access
the Postgres server that houses the database.  Also, because you have done this, 
you will need to create a Secrets Manager endpoint in the same VPC.
#### Secrets Manager Access Needed
The Lambda functions all use Secrets Manager to safely access database
credentials.  You will need to allow the role the functions run under to access
secrets manager, and as mentioned above you will need to create an endpoint
for it.

## API Gateway Notes
### CORS
CORS must be enabled for the application to function.
### Cognito Authorizer
While the application will work without a Cognito authorizer added to each
method, it will be insecure and available to the entire internet.  Ignore this
at your peril.
The authorizer must be configured on a per-method basis.  You do not need to
specify an OAuth Scope or a Request Validator.
### Mapping Template For Delete Method
We use a query string in the delete method.  A simple mapping template is created
for this
`
{
	"movie_id": "$input.params('movie_id')"
}
`
