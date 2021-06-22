package recommendation;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import database.MySQLConnection;
import entity.Item;
import external.RemotiveClient;

public class Recommendation {
	
	public List<Item> recommendItems(String userId, String category) {
		
		// Step 1. Get all favorite items of the user_id.
		MySQLConnection connection  = new MySQLConnection();
		Set<Item> favoriteItems = connection.getFavoriteItems(userId);
		
		// Step 2. Collect favorite itemIds of the category in favoriteItems.
		Set<String> favoriteItemIds = new HashSet<>();
		
		for(Item item : favoriteItems) {
			if(item.getCategory().equals(category)) {
				favoriteItemIds.add(item.getItemId());
			}
		}
		
		// Step 3. Get all keywords of favorite items, sort by count.
		// For example: {"JavaScript": 6, "Information technology": 4, "React (web framework)": 3, "Computing": 1}.
		Map<String, Integer> allKeywords = new HashMap<>();
		
		for(String itemId : favoriteItemIds) {
			Set<String> keywords = connection.getKeywords(itemId);
			
			for(String keyword : keywords) {
				allKeywords.put(keyword, allKeywords.getOrDefault(keyword, 0) + 1);
			}
		}
		
		connection.close();
		
		List<Entry<String, Integer>> keywordEntries = new ArrayList<>(allKeywords.entrySet());
		
		Collections.sort(keywordEntries, (Entry<String, Integer> e1, Entry<String, Integer> e2) -> {
			return Integer.compare(e1.getValue(), e2.getValue());
		});
		
		// Truncate keyword count to only top 5.
		if(keywordEntries.size() > 5) keywordEntries = keywordEntries.subList(0, 5); 
		
		// Step 4. Start a new search of the category. 
		// Then match keywords with the description in latest search items to collect recommendedItems.
		RemotiveClient remotiveClient = new RemotiveClient();
		remotiveClient.isBulkSearch = true;
		List<Item> rawSearchItems = remotiveClient.search(category);
		
		if(rawSearchItems.size() == 0) return new ArrayList<>();
		
		List<Item> recommendedItems = new ArrayList<>();
		int limit = 10;
		
		for(Item item : rawSearchItems) {
			String itemDescription = item.getDescription();
			String itemId = item.getItemId();
			boolean hasKeyword = false;
			
			for(int i = 0; i < keywordEntries.size(); i++) {
				String keyword = keywordEntries.get(i).getKey();

				if(itemDescription.toLowerCase().indexOf(keyword.toLowerCase()) != -1 && !favoriteItemIds.contains(itemId)) {
					recommendedItems.add(item);
					hasKeyword = true;
				}
				if(hasKeyword) break;
			}	
			if(recommendedItems.size() == limit) break;
		}	
		return recommendedItems;
	}
}
