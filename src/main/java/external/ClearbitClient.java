package external;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Base64;

import org.apache.http.HttpEntity;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;

import org.json.JSONObject;

public class ClearbitClient {

	private static final String URL_TEMPLATE_clearbit = "https://company.clearbit.com/v1/domains/find?name=:%s";
	private static final String CREDENTIALS_clearbit = System.getenv("CREDENTIALS_clearbit");

	public JSONObject getCompanyDomain(String keyword) {

		try {
			keyword = URLEncoder.encode(keyword, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}

		// Execute URL and compose the response.
		try {
			String url = String.format(URL_TEMPLATE_clearbit, keyword);
			HttpGet request = new HttpGet(url);
			String auth = CREDENTIALS_clearbit + ":";

			byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes());
			String authHeader = "Basic " + new String(encodedAuth);
			request.setHeader(HttpHeaders.AUTHORIZATION, authHeader);

			HttpClient client = HttpClientBuilder.create().build();
			HttpResponse response = client.execute(request);
			HttpEntity entity = response.getEntity();

			// Return the jobs in the response body in when the response code is 200 and the
			// response has contents.
			if (response.getStatusLine().getStatusCode() == 200 && entity != null) {
				String responseString = EntityUtils.toString(entity);
				return new JSONObject(responseString);
			}
		} catch (ClientProtocolException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return new JSONObject();
	}
}