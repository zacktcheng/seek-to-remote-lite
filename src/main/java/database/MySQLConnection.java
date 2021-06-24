package database;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import entity.Item;
import entity.Item.Builder;
import external.TextRazorClient;
import helper.Helper;

public class MySQLConnection {
	
	private Connection conn;
	
	public MySQLConnection() {
		
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			conn = new MySQLDatabaseUtility().getConnection();
		} 
		catch (ClassNotFoundException e) { e.printStackTrace(); }
		catch(SQLException e) { e.printStackTrace(); } 
	}

	public void close() {
		
		if(conn != null) {	
			try { conn.close(); } 
			catch (Exception e) { e.printStackTrace(); }
		}
	}
	
	public void setFavoriteItems(String userId, Item item) {
		
		if(conn == null) {
			System.err.println("DataBase connection failed.");
			return;
		}
		
		saveItem(item);
		String sql = "INSERT INTO history (user_id, item_id) VALUES (?, ?)";
		
		try {
			PreparedStatement prepStatement = conn.prepareStatement(sql);
			prepStatement.setString(1, userId);
			prepStatement.setString(2, item.getItemId());
			prepStatement.executeUpdate();
		} 
		catch(SQLException e) { e.printStackTrace(); }
	}
	
	public void unsetFavoriteItems(String userId, String itemId) {
		
		if(conn == null) {
			System.err.println("DataBase connection failed.");
			return;
		}
		
		String sql = "DELETE FROM history WHERE user_id = ? AND item_id = ?";
		
		try {
			PreparedStatement prepStatement = conn.prepareStatement(sql);
	        prepStatement.setString(1, userId);
	        prepStatement.setString(2, itemId);
	        prepStatement.executeUpdate();
		} 
		catch(SQLException e) { e.printStackTrace(); }
	}
	
	public void saveItem(Item item) {
		
		if(conn == null) {	
			System.err.println("DataBase connection failed.");
			return;
		}
		
		// Extract keywords from the description and store them in a HashSet to use in future. 
		// Keywords are used for keyword-description matching while processing recommendItems().
		List<String> keywords = null;
		String descriptionInPlainText = "";

		if(item.getDescription() != null && !item.getDescription().trim().isEmpty()) {
			String descriptionInHTML = item.getDescription();
			descriptionInPlainText = Helper.getPlainTextFromHTMLFormatText(descriptionInHTML).trim();

			// Extract keywords from description.
			keywords = TextRazorClient.extractKeywords(descriptionInPlainText, 10);
		}

		String sql = "INSERT IGNORE INTO items VALUES (?, ?, ?, ?, ?, ?, ?)";
		
		try {
			PreparedStatement prepStatement = conn.prepareStatement(sql);
			prepStatement.setString(1, item.getItemId());
			prepStatement.setString(2, item.getTitle());
			prepStatement.setString(3, item.getCompanyName());
			prepStatement.setString(4, item.getCategory());
			prepStatement.setString(5, item.getUrl());
			prepStatement.setString(6, item.getCompanyLogoUrl());
			prepStatement.setString(7, descriptionInPlainText);
			prepStatement.executeUpdate();
			
			sql = "INSERT IGNORE INTO keywords VALUES (?, ?)";
            prepStatement = conn.prepareStatement(sql);
			prepStatement.setString(1, item.getItemId());
			
			for(String keyword : keywords) {
				prepStatement.setString(2, keyword);
				prepStatement.executeUpdate();
			}
		} 
		catch(SQLException e) { e.printStackTrace(); }
	}
	
	public Set<String> getFavoriteItemIds(String userId) {
		
		if(conn == null) {
			System.err.println("DataBase connection failed.");
			return new HashSet<>();
		}

		Set<String> favoriteItems = new HashSet<>();

		try {
			String sql = "SELECT item_id FROM history WHERE user_id = ?";
			PreparedStatement statement = conn.prepareStatement(sql);
			statement.setString(1, userId);
			ResultSet resultSet = statement.executeQuery();
			
			while(resultSet.next()) {	
				String itemId = resultSet.getString("item_id");
				favoriteItems.add(itemId);
			}
		} 
		catch(SQLException e) { e.printStackTrace(); }

		return favoriteItems;
	}
	
	public Set<Item> getFavoriteItems(String userId) {
		
		if(conn == null) {
			System.err.println("DataBase connection failed.");
			return new HashSet<>();
		}
		
		Set<Item> favoriteItems = new HashSet<>();
		Set<String> favoriteItemIds = getFavoriteItemIds(userId);

		String sql = "SELECT * FROM items WHERE item_id = ?";
		
		try {
			PreparedStatement statement = conn.prepareStatement(sql);
			
			for(String itemId : favoriteItemIds) {
				statement.setString(1, itemId);
				ResultSet resultSet = statement.executeQuery();

				Builder builder = new Item.Builder();

				if(resultSet.next()) {	
					builder.itemId(resultSet.getString("item_id"));
					builder.title(resultSet.getString("title"));
					builder.companyName(resultSet.getString("company_name"));
					builder.category(resultSet.getString("category"));
					builder.url(resultSet.getString("url"));
					builder.companyLogoUrl(resultSet.getString("company_logo_url"));
					builder.description(resultSet.getString("description"));
					builder.keywords(getKeywords(itemId));
					favoriteItems.add(builder.build());
				}
			}
		}
		catch (SQLException e) { e.printStackTrace(); }
		
		return favoriteItems;
	}

	public Set<String> getKeywords(String itemId) {
		
		if(conn == null) {
			System.err.println("DataBase connection failed.");
			return null;
		}
		
		Set<String> keywords = new HashSet<>();
		String sql = "SELECT keyword from keywords WHERE item_id = ? ";
		
		try {
			PreparedStatement statement = conn.prepareStatement(sql);
			statement.setString(1, itemId);
			ResultSet resultSet = statement.executeQuery();
			
			while(resultSet.next()) {
				String keyword = resultSet.getString("keyword");
				keywords.add(keyword);
			}
		} 
		catch (SQLException e) { e.printStackTrace(); }
		
		return keywords;
	}
	
	public String getUsername(String userId) {
		
		if(conn == null) {
			System.err.println("DataBase connection failed.");
			return "";
		}
		
		String sql = "SELECT first_name, last_name FROM users WHERE user_id = ?";
		
		try {
			PreparedStatement statement = conn.prepareStatement(sql);
			statement.setString(1, userId);
			ResultSet resultSet = statement.executeQuery();
			
			if (resultSet.next()) {
				return resultSet.getString("first_name") + " " + resultSet.getString("last_name");
			}
		} 
		catch(SQLException e) { System.out.println(e.getMessage()); }
		
		return "";
	} 
	
	public boolean verifyLogin(String userId, String password) {
		
		if(conn == null) {
			System.err.println("DataBase connection failed.");
			return false;
		}
		
		String sql = "SELECT user_id FROM users WHERE user_id = ? AND password = ?";
		
		try {
			PreparedStatement statement = conn.prepareStatement(sql);
			statement.setString(1, userId);
			statement.setString(2, password);
			ResultSet resultSet = statement.executeQuery();
			
			if(resultSet.next()) return true;
		} 
		catch(SQLException e) { System.out.println(e.getMessage()); }
		
		return false;
	}
	
	public boolean addUser(String userId, String password, String firstName, String lastName) {
		
		if(conn == null) {
			System.err.println("DataBase connection failed.");
			return false;
		}
		
		String sql = "INSERT IGNORE INTO users VALUES (?, ?, ?, ?)";
		
		try {
			PreparedStatement statement = conn.prepareStatement(sql);
			statement.setString(1, userId);
			statement.setString(2, password);
			statement.setString(3, firstName);
			statement.setString(4, lastName);

			return statement.executeUpdate() == 1;
		} 
		catch(SQLException e) { e.printStackTrace(); }
		
		return false;
	}
}
