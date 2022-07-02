import psycopg2
import requests
import jsons
import datetime



def fetchData(bbox):
    print('Fetching data for bbox = ',bbox)
    today = datetime.datetime.now().date().isoformat()
    # url ='https://api.inaturalist.org/v1/observations?verifiable=true&order_by=observations.id&order=desc&page=1&spam=false&d1=%s&nelat=%s&nelng=%s&swlat=%s&swlng=%s&taxon_id=256089&locale=en-US&per_page=200'%(today,bbox[0],bbox[1],bbox[2],bbox[3])
    url ='https://api.inaturalist.org/v1/observations?verifiable=true&order_by=observations.id&order=desc&page=1&spam=false&nelat=%s&nelng=%s&swlat=%s&swlng=%s&taxon_id=256089&locale=en-US&per_page=200'%(bbox[0],bbox[1],bbox[2],bbox[3])
    print('Sending request...')
    res = requests.get(url, timeout=45)
    response = jsons.loads(res.text)
    print('Reading response...')
    print('Fetched results:',len(response['results']))
    if response['total_results'] == 0:
        print('no observation for today')
        return 0

    results = []
    for obs in response["results"]:
        date = datetime.datetime.now().isoformat()
        obj = {
            "name" : "iNaturalist Observer",
            "comment" : obs["species_guess"],
            "longitude" : obs["geojson"]["coordinates"][0],
            "latitude" : obs["geojson"]["coordinates"][1],
            "obsDate" : obs["observed_on"],
            "date" : date
        }
        results.append(obj)
        # print(obj)
    return results


def postData(data):
    # Connect with the db
    #Establishing the connection
    conn = psycopg2.connect(
       database='d550ocuaqoce9v', user='ftywbweoftixbd', password='5b0fc460f2246c0e8251a11a6523a9ef595fb6a0acca6ca95ded0e154646e0ff', host='ec2-52-212-228-71.eu-west-1.compute.amazonaws.com', port= '5432'
    )
    conn.autocommit = True
    cursor = conn.cursor()

     # Preparing SQL queries to INSERT a record into the database.
    print('Posting data into inaturalist table ...')
    for obs in data:
        sql_insert = 'INSERT INTO inaturalist (name, comment, longitude, latitude, obsDate, date) VALUES (%s, %s, %s, %s, %s, %s)'
        cursor.execute(sql_insert, (str(obs['name']), str(obs['comment']), str(obs['longitude']), str(obs['latitude']), str(obs['obsDate']), str(obs['date'])))



    # Commit your changes in the database
    conn.commit()
    print("Records inserted...")

    # Closing the connection
    conn.close()

with open("bboxes.geojson", "r+") as bboxes:
    # Reading form a file
    bboxes = jsons.loads(bboxes.read())
    # print(bboxes)


# bbox_list = [[37.96099577857019, 24.101871964567575,37.70749064648202, 23.224173763021625]]
#
total_data = []
for bbox in bboxes['features']:
    bbox_ = bbox['geometry']['coordinates']
    for bbox__ in bbox_:
        ur = bbox__[0] # upper-right
        bl = bbox__[1] # bottom-left
        for bbox___ in bbox__:
            if bbox___[0] >= ur[0] and bbox___[1] >= ur[1]:
                ur = bbox___
            if bbox___[0] <= bl[0] and bbox___[1] <= bl[1]:
                bl = bbox___
        # print('ur = ',ur,'\n','bl = ',bl,'\n')
    fetched_data = fetchData( [ur[1],ur[0],bl[1],bl[0]] )
    if fetched_data != 0:
        total_data += fetched_data
        print('Observations added to list')
    # break
print(len(total_data), 'observations added today')
postData(total_data)
