package database;

import java.net.URI;
import java.net.URISyntaxException;

public class MySQLDatabaseUtility {
	
	private static URI getDB_URI() {
		
		URI DB_URI = null;
		
		try {
			DB_URI = new URI(System.getenv("CLEARDB_DATABASE_URL"));
		}
		catch (URISyntaxException e) { e.printStackTrace(); }

		return DB_URI;
	}
	
	public static String getDB_USERNAME() {
		
		URI DB_URI = getDB_URI();
		
		if(DB_URI != null && DB_URI.getUserInfo() != null) {
			return DB_URI.getUserInfo().split(":")[0];
		}    	
        return null; 
    }
    
    public static String getDB_PASSWORD() {
    	
    	URI DB_URI = getDB_URI();
		
		if(DB_URI != null && DB_URI.getUserInfo() != null) {
			return DB_URI.getUserInfo().split(":")[1];
		}
        return null;
    }
    
    public static String getDB_URL() {
    	
    	URI DB_URI = getDB_URI();
    	
    	if(DB_URI != null && DB_URI.getHost() != null && DB_URI.getPath() != null) {
    		return "jdbc:mysql://" + DB_URI.getHost() + DB_URI.getPath();
		}
    	return null;
    }
}