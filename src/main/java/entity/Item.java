package entity;

import java.util.Objects;
import java.util.Set;

import org.json.JSONObject;

// Builder pattern builds a complex object using simple objects and using a step by step approach.
public class Item {

	private String itemId;
	private String title;
	private String companyName;
	private String category;
	private String url;
	private String companyLogoUrl;
	private String description;
	private Set<String> keywords;

	private Item(Builder builder) {
		this.itemId = builder.itemId;
		this.title = builder.title;
		this.companyName = builder.companyName;
		this.category = builder.category;
		this.url = builder.url;
		this.companyLogoUrl = builder.companyLogoUrl;
		this.description = builder.description;
		this.keywords = builder.keywords;
	}

	public String getItemId() {
		return itemId;
	}

	public String getTitle() {
		return title;
	}

	public String getCompanyName() {
		return companyName;
	}

	public String getCategory() {
		return category;
	}

	public String getUrl() {
		return url;
	}

	public String getCompanyLogoUrl() {
		return companyLogoUrl;
	}

	public String getDescription() {
		return description;
	}

	public Set<String> getKeywords() {
		return keywords;
	}

	public void setKeywords(Set<String> keywords) {
		this.keywords = keywords;
	}

	@Override
	public boolean equals(Object comparatorObj) {

		if (this == comparatorObj)
			return true;
		if (comparatorObj == null || getClass() != comparatorObj.getClass())
			return false;

		Item comparatorItem = (Item) comparatorObj;

		return Objects.equals(itemId, comparatorItem.itemId) && Objects.equals(title, comparatorItem.title)
				&& Objects.equals(companyName, comparatorItem.companyName)
				&& Objects.equals(category, comparatorItem.category) && Objects.equals(url, comparatorItem.url)
				&& Objects.equals(companyLogoUrl, comparatorItem.companyLogoUrl)
				&& Objects.equals(keywords, comparatorItem.keywords);
	}

	@Override
	public int hashCode() {
		return Objects.hash(itemId, title, companyName, category, url, companyLogoUrl, keywords);
	}

	public JSONObject toJSONObject() {

		JSONObject itemJSONObj = new JSONObject();
		itemJSONObj.put("itemId", itemId);
		itemJSONObj.put("title", title);
		itemJSONObj.put("companyName", companyName);
		itemJSONObj.put("category", category);
		itemJSONObj.put("url", url);
		itemJSONObj.put("companyLogoUrl", companyLogoUrl);
		itemJSONObj.put("description", description);
		itemJSONObj.put("keywords", keywords);
		return itemJSONObj;
	}

	public static class Builder {

		private String itemId;
		private String title;
		private String companyName;
		private String category;
		private String url;
		private String companyLogoUrl;
		private String description;
		private Set<String> keywords;

		public Builder itemId(String itemId) {
			this.itemId = itemId;
			return this;
		}

		public Builder title(String title) {
			this.title = title;
			return this;
		}

		public Builder companyName(String companyName) {
			this.companyName = companyName;
			return this;
		}

		public Builder category(String category) {
			this.category = category;
			return this;
		}

		public Builder url(String url) {
			this.url = url;
			return this;
		}

		public Builder companyLogoUrl(String companyLogoUrl) {
			this.companyLogoUrl = companyLogoUrl;
			return this;
		}

		public Builder description(String description) {
			this.description = description;
			return this;
		}

		public Builder keywords(Set<String> keywords) {
			this.keywords = keywords;
			return this;
		}

		public Item build() {
			return new Item(this);
		}
	}
}