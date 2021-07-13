package database;

import java.sql.Statement;
import java.sql.Connection;

public class MySQLTableCreation {

	// Run this as Java application to reset the database
	public static void main(String[] args) {

		try {
			// step 1. connect to MySQL.
			Class.forName("com.mysql.cj.jdbc.Driver");
			MySQLDatabaseUtility databseUtility = new MySQLDatabaseUtility();
			System.out.println("Connecting to " + databseUtility.getDatabaseUrl());
			Connection conn = databseUtility.getConnection();

			if (conn == null) return;

			// step 2. drop tables in case they exist.
			Statement statement = conn.createStatement();
			String sql = "DROP TABLE IF EXISTS keywords";
			statement.executeUpdate(sql);

			sql = "DROP TABLE IF EXISTS history";
			statement.executeUpdate(sql);

			sql = "DROP TABLE IF EXISTS items";
			statement.executeUpdate(sql);

			sql = "DROP TABLE IF EXISTS users";
			statement.executeUpdate(sql);

			// step 3. create new tables.
			sql = "CREATE TABLE items(" 
			        + "item_id VARCHAR(255) NOT NULL," 
					+ "title VARCHAR(255),"
					+ "company_name VARCHAR(255)," 
					+ "category VARCHAR(225)," 
					+ "url VARCHAR(255),"
					+ "company_logo_url VARCHAR(225),"
					+ "job_type VARCHAR(225),"
					+ "publication_date VARCHAR(225),"
					+ "required_location VARCHAR(225),"
					+ "salary VARCHAR(225),"
					+ "description TEXT," 
					+ "PRIMARY KEY (item_id)" 
					+ ")";
			statement.executeUpdate(sql);

			sql = "CREATE TABLE users(" + "user_id VARCHAR(255) NOT NULL," + "password VARCHAR(255) NOT NULL,"
					+ "first_name VARCHAR(255)," + "last_name VARCHAR(255)," + "PRIMARY KEY (user_id)" + ")";
			statement.executeUpdate(sql);

			sql = "CREATE TABLE keywords(" + "item_id VARCHAR(255) NOT NULL," + "keyword VARCHAR(255) NOT NULL,"
					+ "PRIMARY KEY (item_id, keyword)," + "FOREIGN KEY (item_id) REFERENCES items(item_id)" + ")";
			statement.executeUpdate(sql);

			sql = "CREATE TABLE history(" + "user_id VARCHAR(255) NOT NULL," + "item_id VARCHAR(255) NOT NULL,"
					+ "last_favor_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
					+ "PRIMARY KEY (user_id, item_id)," + "FOREIGN KEY (user_id) REFERENCES users(user_id),"
					+ "FOREIGN KEY (item_id) REFERENCES items(item_id)" + ")";
			statement.executeUpdate(sql);

			// step 4. insert fake user 1111/3229c1097c00d497a0fd282d586be050.
			sql = "INSERT INTO users VALUES ('1111', '3229c1097c00d497a0fd282d586be050', 'John', 'Smith')";
			statement.executeUpdate(sql);

			conn.close();
			System.out.println("Import done successfully");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}