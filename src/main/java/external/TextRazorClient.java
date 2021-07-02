package external;

import java.util.ArrayList;
import java.util.List;

import com.textrazor.AnalysisException;
import com.textrazor.NetworkException;
import com.textrazor.TextRazor;
import com.textrazor.annotations.Response;
import com.textrazor.annotations.Topic;

public class TextRazorClient {

	private static final String CREDENTIALS_TextRazor = System.getenv("CREDENTIALS_TextRazor");
	private static final int DEFAULT_LIMIT = 10;

	public static List<String> extractKeywords(String text, int limit) {

		if (text != null && text.length() > 0) {
			if (1 > limit || limit < 11) limit = DEFAULT_LIMIT;
			TextRazor textRazorclient = new TextRazor(CREDENTIALS_TextRazor);
			textRazorclient.addExtractor("topics");

			try {
				Response response = textRazorclient.analyze(text).getResponse();
				List<Topic> topics = response.getTopics();
				List<String> topicList = new ArrayList<>();
				int i = 0;

				while (i < topics.size() && i < limit) {
					topicList.add(topics.get(i++).getLabel());
				}
				return topicList;
			} catch (NetworkException e) {
				e.printStackTrace();
			} catch (AnalysisException e) {
				e.printStackTrace();
			}
		}
		return null;
	}
}
