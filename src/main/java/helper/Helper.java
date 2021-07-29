package helper;

import org.json.JSONArray;
import org.json.JSONObject;

import entity.Item;

import java.io.BufferedReader;
import java.io.IOException;
import java.net.URL;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

public class Helper {

    private static final Set<String> BUSINESS_ENTITY_SET = getBusinessEntitySet();

    // A helper function to write a JSONArray to HTTP response.
    public static void writeJsonArray(HttpServletResponse response, JSONArray array) throws IOException {

        response.setContentType("application/json");
        response.getWriter().print(array);
    }

    // A helper function to write a JSONObject to HTTP response.
    public static void writeJsonObject(HttpServletResponse response, JSONObject object) throws IOException {

        response.setContentType("application/json");
        response.getWriter().print(object);
    }

    // Parses a JSONObject from http request.
    public static JSONObject readJSONObject(HttpServletRequest request) throws IOException {

        BufferedReader reader = new BufferedReader(request.getReader());
        StringBuilder requestBody = new StringBuilder();
        String line = null;

        while ((line = reader.readLine()) != null) {
            requestBody.append(line);
        }
        return new JSONObject(requestBody.toString());
    }

    // Convert a JSON object to Item object.
    public static Item parseFavoriteItem(JSONObject favoriteItem) {

        Item item = new Item.Builder().itemId(getStringFieldOrEmpty(favoriteItem, "itemId"))
                .title(getStringFieldOrEmpty(favoriteItem, "title"))
                .companyName(getStringFieldOrEmpty(favoriteItem, "companyName"))
                .category(getStringFieldOrEmpty(favoriteItem, "category"))
                .url(getStringFieldOrEmpty(favoriteItem, "url"))
                .companyLogoUrl(getStringFieldOrEmpty(favoriteItem, "companyLogoUrl"))
                .jobType(getStringFieldOrEmpty(favoriteItem, "jobType"))
                .date(getStringFieldOrEmpty(favoriteItem, "date"))
                .location(getStringFieldOrEmpty(favoriteItem, "location"))
                .salary(getStringFieldOrEmpty(favoriteItem, "salary"))
                .description(getStringFieldOrEmpty(favoriteItem, "description"))
                .build();

        Set<String> keywords = new HashSet<>();
        JSONArray array = favoriteItem.getJSONArray("keywords");

        for (int i = 0; i < array.length(); i++) {
            keywords.add(array.getString(i));
        }

        item.setKeywords(keywords);
        return item;
    }

    public static String getStringFieldOrEmpty(JSONObject obj, String field) {
        return obj.isNull(field) ? "" : obj.get(field).toString();
    }

    public static String trimKeywordToGetCompanyLogoUrl(JSONObject object) {

        String companyName = object.get("company_name").toString();

        // Replace all special characters with white spaces, then split it into substrings.
        companyName = companyName.replaceAll("[^a-zA-Z0-9]", " ").toLowerCase();
        String[] substrings = companyName.split(" ");
        String keyword = "";

        // Reconstruct keyword from substrings when there are 1+ substrings.
        for (int i = 0; i < substrings.length; i++) {
            // Check whether to exclude the company suffix.
            // Determination: if the last substring can be fond in BUSINESS_ENTITY_SET.
            // We don't want to include the suffix because it will rule out the company logo url search result.
            if (i < substrings.length - 1 || !BUSINESS_ENTITY_SET.contains(substrings[i])) {
                keyword += substrings[i];
            }
        }
        return keyword;
    }

    private static HashSet<String> getBusinessEntitySet() {

        HashSet<String> BusinessEntitySet = new HashSet<>();
        String[] BusinessEntityArray = { "corporation", "corp", "incorporated", "inc", "company", "co", "limited",
                "ltd", "lc", "llc", "pllc", "lps", "llps", "lllps", "gps" };

        for (int i = 0; i < BusinessEntityArray.length; i++) {
            BusinessEntitySet.add(BusinessEntityArray[i]);
        }
        return BusinessEntitySet;
    }

    public static boolean isValidUrl(String url) {

        try {
            new URL(url).toURI();
            return true;
        }
        // Return false if there was an Exception while creating an URL object.
        catch (Exception ignore) {
            return false;
        }
    }

    public static String getPlainTextFromHTMLFormatText(String htmlFormatText) {

        String plainText = "";

        if (htmlFormatText != null && !htmlFormatText.trim().isEmpty()) {
            // Replace "\n" with "".
            htmlFormatText = htmlFormatText.replaceAll("\\n", "");
            Document document = Jsoup.parse(htmlFormatText);
            Elements lis = document.select("li");

            if (lis.size() > 0) {
                StringBuilder builder = new StringBuilder();

                for (int i = 0; i < lis.size(); i++) {
                    // Get all texts within.
                    // visit: https://jsoup.org/cookbook/extracting-data/attributes-text-html.
                    if (lis.get(i).hasText()) {
                        String compoundText = lis.get(i).text();

                        if (!compoundText.trim().isEmpty()) {
                            String sentence = "- " + compoundText;

                            if (!sentence.substring(sentence.length() - 1).equals(".")) sentence += ".";
                            builder.append(sentence + " ");
                        }
                    }
                }
                if (builder.toString() != null) plainText = builder.toString();
            }
        }
        return plainText;
    }
}