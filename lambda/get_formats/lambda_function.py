import json
import boto3
import psycopg2
def lambda_handler(event, context):
    #Return all movies in the database
    #get database connection secrets
    session = boto3.session.Session()
    secrets = session.client(
        service_name='secretsmanager',
        region_name='us-west-2'
    )
    try:
        db_creds =\
            json.loads(secrets.get_secret_value(SecretId = 'moviedb_creds')['SecretString'])
    except Exception as ex:
        return {
            'statusCode' : 500,
            'body': json.dumps('An error ' + str(ex) + ' has occurred when getting database credentials')
        }
    try:
        conn = psycopg2.connect(host=db_creds['host'], dbname='movie_collection', 
                                user=db_creds['username'],
                                password=db_creds['password'],
                                port=db_creds['port'])
   
        cursor = conn.cursor()
        cursor.execute('select id,format from format;')
        output = []
        for row in cursor.fetchall():
            output.append({'id' : row[0], 'format' : row[1]})
    except Exception as ex:
        return {
            'statusCode' : 500,
            'body': json.dumps('An error ' + str(ex) + ' has occurred running query')
        }
    else:
        cursor.close()
        conn.close()
        return {
            'statusCode': 200,
            'body': json.dumps(output)
        }
