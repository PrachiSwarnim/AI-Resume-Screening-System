"""
TalentIQ Vector Search Service
TF-IDF Vectorization + Cosine Similarity for mathematical resume-JD matching.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def compute_vector_similarity(resume_text: str, job_description: str) -> int:
    """
    Compute TF-IDF cosine similarity between resume and job description.
    
    Converts both documents into high-dimensional TF-IDF vectors,
    then measures angular distance via cosine similarity.
    
    Returns: Integer percentage (0-100) representing semantic overlap.
    """
    try:
        vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        tfidf_matrix = vectorizer.fit_transform([job_description, resume_text])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return int(round(similarity * 100))
    except Exception:
        return 0
