package external;

import entity.Item;
import helper.Helper;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.HttpEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import org.json.JSONArray;
import org.json.JSONObject;

public class RemotiveClient {

    // Use "category" to store the career name, use "search" store the job title.
    private static final String URL_TEMPLATE_Remotive = "https://remotive.io/api/remote-jobs?category=%s&limit=%s";
    private static final Map<String, String> CATEGORIES = getCategories();

    // Lottery style item selection in JSONArray.
    public boolean isRandomized = false;
    // For recommendItems() purpose, set it false to store job descriptions in Item
    // instances, and for vast search.
    public boolean isBulkSearch = false;

    public List<Item> search(String category) {

        String categorySlug = getCategorySlug(category, true);
        String limit = "20";

        if (isBulkSearch || isRandomized) limit = "100";

        try {
            category = URLEncoder.encode(categorySlug, "UTF-8");
            limit = URLEncoder.encode(limit, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        String url = String.format(URL_TEMPLATE_Remotive, categorySlug, limit);
        CloseableHttpClient httpClient = HttpClients.createDefault();

        // Execute URL and compose the response.
        try {
            HttpGet request = new HttpGet(url);
            CloseableHttpResponse response = httpClient.execute(request);
            HttpEntity entity = response.getEntity();

            // Return the jobs in the response body in when the response code is 200 and the
            // response has contents.
            if (response.getStatusLine().getStatusCode() == 200 && entity != null) {
                String responseString = EntityUtils.toString(entity);
                JSONObject responseObject = new JSONObject(responseString);

                return getItemList(responseObject.getJSONArray("jobs"));
            }
        } catch (ClientProtocolException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    // Help to create a list of items for each JSONObject in the response JSONArray above to return.
    public List<Item> getItemList(JSONArray array) {

        List<Item> itemList = new ArrayList<>();

        if (array == null || array.length() == 0) return itemList;

        // Create each item.
        if (isRandomized) {
            Random rand = new Random();
            int limit = 10;
            Set<String> visitedItemIds = new HashSet<>();

            while (visitedItemIds.size() < array.length() && visitedItemIds.size() < limit) {
                int i = rand.nextInt(array.length());

                if (array.get(i) != null) {
                    JSONObject object = array.getJSONObject(i);
                    String itemId = Helper.getStringFieldOrEmpty(object, "id");

                    if (itemId != null && !itemId.trim().isEmpty() && !visitedItemIds.contains(itemId)) {
                        Item item = getItemForItemList(object);
                        itemList.add(item);
                        visitedItemIds.add(itemId);
                    }
                }
            }
        } else {
            for (int i = 0; i < array.length(); i++) {
                if (array.get(i) != null) {
                    JSONObject object = array.getJSONObject(i);
                    Item item = getItemForItemList(object);
                    itemList.add(item);
                }
            }
        }
        return itemList;
    }

    private static Item getItemForItemList(JSONObject object) {

        // Handle logo url beforehand.
        String companyLogoUrl = getCompanyLogUrl(object);

        // Convert HTML to human readable text.
        String descriptionInPlainText = "";

        if (object.has("description") && object.get("description") != null) {
            String descriptionInHTML = object.get("description").toString();
            descriptionInPlainText = Helper.getPlainTextFromHTMLFormatText(descriptionInHTML).trim();
        }
        Item item = new Item.Builder().itemId(Helper.getStringFieldOrEmpty(object, "id"))
                .title(Helper.getStringFieldOrEmpty(object, "title"))
                .companyName(Helper.getStringFieldOrEmpty(object, "company_name"))
                .category(Helper.getStringFieldOrEmpty(object, "category"))
                .url(Helper.getStringFieldOrEmpty(object, "url"))
                .companyLogoUrl(companyLogoUrl)
                .jobType(Helper.getStringFieldOrEmpty(object, "job_type"))
                .date(Helper.getStringFieldOrEmpty(object, "publication_date"))
                .location(Helper.getStringFieldOrEmpty(object, "candidate_required_location"))
                .salary(Helper.getStringFieldOrEmpty(object, "salary"))
                .description(descriptionInPlainText)
                .build();

        return item;
    }

    private static String getCompanyLogUrl(JSONObject object) {

        String companyName = Helper.getStringFieldOrEmpty(object, "company_name");

        if (companyName != null && !companyName.trim().isEmpty()) {
            ClearbitClient clearbitClient = new ClearbitClient();
            String keywordForLogoUrl = Helper.trimKeywordToGetCompanyLogoUrl(object);

            if (keywordForLogoUrl != null && !keywordForLogoUrl.trim().isEmpty()) {
                JSONObject domainObj = clearbitClient.getCompanyDomain(keywordForLogoUrl);

                // Only assign back to companyLogoUrl if the logo url has passed the url
                // validation.
                // Otherwise companyLogoUrl shall be kept vacant.
                if (!domainObj.isEmpty() && domainObj.has("logo")) {
                    if (domainObj.get("logo") != null) {
                        String companyLogoUrl = domainObj.get("logo").toString();

                        if (Helper.isValidUrl(companyLogoUrl)) return companyLogoUrl;
                    }
                }
            }
        }
        return "";
    }

    // Check out https://remotive.io/api/remote-jobs/categories for predefined
    // categories.
    private static Map<String, String> getCategories() {

        Map<String, String> categoryMap = new HashMap<>();
        categoryMap.put("Software Development", "software-dev");
        categoryMap.put("Customer Service", "customer-support");
        categoryMap.put("Design", "design");
        categoryMap.put("Marketing", "marketing");
        categoryMap.put("Sales", "sales");
        categoryMap.put("Product", "product");
        categoryMap.put("Business", "business");
        categoryMap.put("Data", "data");
        categoryMap.put("DevOps / Sysadmin", "devops");
        categoryMap.put("Finance / Legal", "finance-legal");
        categoryMap.put("Human Resources", "hr");
        categoryMap.put("QA", "qa");
        categoryMap.put("Teaching", "teaching");
        categoryMap.put("Writing", "writing");
        categoryMap.put("Medical / Health", "medical-health");
        categoryMap.put("All others", "all-others");

        return categoryMap;
    }

    public static String getCategorySlug(String category, boolean setDefaultSlug) {

        if (category == null || category.trim().isEmpty() || !CATEGORIES.containsKey(category)) {
            if (setDefaultSlug) return CATEGORIES.get("Software Development");
            return null;
        }
        return CATEGORIES.get(category);
    }
}