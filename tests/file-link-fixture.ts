// Synthetic fixture only: never a usable AWS signature or storage credential.
export function signedFileLink(extension = "pdf", validForSeconds = 300) {
  const now = new Date(Math.floor(Date.now() / 1000) * 1000);
  const date = now.toISOString().replace(/[-:]|\.000/g, "");
  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `fixture/${date.slice(0, 8)}/ap-southeast-1/s3/aws4_request`,
    "X-Amz-Date": date,
    "X-Amz-Expires": String(validForSeconds),
    "X-Amz-SignedHeaders": "host",
    "X-Amz-Signature": "a".repeat(64),
  });
  return {
    url: `https://private-test-bucket.s3.ap-southeast-1.amazonaws.com/private-assets/11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222.${extension}?${query}`,
    expires_at: new Date(now.getTime() + validForSeconds * 1000).toISOString(),
    valid_for_seconds: validForSeconds,
    requires_authenticated_session: false,
  };
}
