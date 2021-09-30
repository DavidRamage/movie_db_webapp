import json
import boto3
import psycopg2
def lambda_handler(event, context):
    #Create a new movie
    #bail out if we don't have all the required keys
    req_keys = ['name', 'length', 'year', 'rating', 'format_id']
    for keyname in req_keys:
        if keyname not in event.keys():
            return {
                'statusCode': 400,
                'body': json.dumps('Required input missing')
            }
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
    	query = """ INSERT INTO movies (title, film_len, release_yr, rating, format_id) VALUES (%s,%s,%s,%s,%s)"""
    	record = (event['name'],event['length'],event['year'],event['rating'],event['format_id'])
    	cursor.execute(query, record)
    	conn.commit()
    except Exception as ex:
        return {
            'statusCode' : 500,
            'body': json.dumps('An error ' + str(ex) + ' has occurred running query')
        }
    else:
    	count = cursor.rowcount
    	cursor.close()
    	conn.close()
    	return {
    	    'statusCode': 200,
    	    'body': json.dumps("Inserted " + str(count) + " rows")
    	}
