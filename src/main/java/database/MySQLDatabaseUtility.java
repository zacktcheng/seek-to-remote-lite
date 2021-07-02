package database;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class MySQLDatabaseUtility {

	private static URI databaseUri;

	public MySQLDatabaseUtility() {

		try {
			databaseUri = new URI(System.getenv("CLEARDB_DATABASE_URL"));
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	public String getDatabaseUrl() {
		return "jdbc:mysql://" + databaseUri.getHost() + databaseUri.getPath();
	}

	public Connection getConnection() throws SQLException {
		String username = databaseUri.getUserInfo().split(":")[0];
		String password = databaseUri.getUserInfo().split(":")[1];
		String databaseUrl = "jdbc:mysql://" + databaseUri.getHost() + databaseUri.getPath();

		return DriverManager.getConnection(databaseUrl, username, password);
	}
}