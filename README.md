## Seek to Remote Lite  
*A content-based job recommendation web app.*  
### :link: [Project Demo URL](https://seek-to-remote-lite.herokuapp.com/)  
*(For demo purposes, feel free to use `{ username: '1111', password: '2222' }` to login.)*  

### Introduction  
***Seek to Remote Lite*** is a personal project to demonstrate the knowledge and skills to design and implement an interactive web app for users 
to search, to save and to apply available job positions around the globe. It's aimed to be developed as a lightweight web app to meet functionality and simplicity.  
The app processes RESTful APIs using Java servlets on Java EE, retrieves job posts using Remotive Job API and stores data on ClearDB with MySQL. It utilizes 
extracted keywords from job descriptions with TextRazor APIs to perform it's Content-based algorithm for the job recommendation. The front-end of this app is 
developed with basic html/css/vanilla Javascript, and it uses ajax to communicate with the back-end server. 

### Overview
Please checkout the flow chart *(Coming soon)*.

### Features
- #### Search jobs
   The app searches remote jobs of the user-selected occupation category. Modifying to display simple and consice version of 
   job information to the end user.  
- #### Random search Jobs in bulk.
   The app searches remote jobs in bulk then randomly picks jobs within fixed quantity. Modifying to display simple and consice 
   version of job information to the end user.  
- #### Edit/Save job posts
   The app is capable of allowing each registered user to edit the saved job posts. It can also extract useful keywords within the job description
   of the saved job posts to further recommmend jobs for the user in future.
- #### Recommend jobs in bulk
   With the extracted keywords and it's recommendation algorithms, the app recommends jobs which are similar to jobs that the user saved previously. 

### Tech
- Java
- Apache Tomcat
- Apache Maven
- REST API
- Remotive Job API
- Clearbit Company Name to Domain API
- TextRazor API
- MySQL
- HTML
- CSS
- JavaScript
- Ajax
- Heroku