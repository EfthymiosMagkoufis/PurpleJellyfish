import psycopg2
import requests
import jsons
import datetime



def fetchData(bbox):
    url ='https://api.inaturalist.org/v1/observations?verifiable=true&order_by=observations.id&order=desc&page=1&spam=false&nelat=%s&nelng=%s&swlat=%s&swlng=%s&taxon_id=256089&locale=en-US&per_page=2'%(bbox[0],bbox[1],bbox[2],bbox[3])
    print(url)
    res = requests.get(url)
    response = jsons.loads(res.text)
    # print(response)
    i=0
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
        print(obj)


def postData(obj):

    # Connect with the db
    #Establishing the connection
    conn = psycopg2.connect(
       database='d550ocuaqoce9v', user='ftywbweoftixbd', password='5b0fc460f2246c0e8251a11a6523a9ef595fb6a0acca6ca95ded0e154646e0ff', host='ec2-52-212-228-71.eu-west-1.compute.amazonaws.com', port= '5432'
    )
    conn.autocommit = True
    cursor = conn.cursor()

     # Preparing SQL queries to INSERT a record into the database.
    cursor.execute('''INSERT INTO inaturalist (FIRST_NAME, LAST_NAME, AGE, SEX,
       INCOME) VALUES ('Ramya', 'Rama priya', 27, 'F', 9000)''')


    # Commit your changes in the database
    conn.commit()
    print("Records inserted........")

    # Closing the connection
    conn.close()

bbox_list = [[37.96099577857019, 24.101871964567575,37.70749064648202, 23.224173763021625]]

for bbox in bbox_list:
    fetchData(bbox)
