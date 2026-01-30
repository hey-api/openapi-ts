from typing import Optional
import httpx


class BaseClient:
    """Base HTTP client using httpx that SDK classes extend."""

    def __init__(self, client: Optional[httpx.Client] = None, base_url: Optional[str] = None, **kwargs):
        if client is not None:
            self._client = client
        else:
            self._client = httpx.Client(base_url=base_url or "", **kwargs)

    @property
    def client(self) -> httpx.Client:
        """Get the httpx client instance."""
        return self._client

    def request(self, method: str, url: str, **kwargs) -> httpx.Response:
        """Make an HTTP request."""
        return self._client.request(method, url, **kwargs)

    def get(self, url: str, **kwargs) -> httpx.Response:
        """Make a GET request."""
        return self._client.get(url, **kwargs)

    def post(self, url: str, **kwargs) -> httpx.Response:
        """Make a POST request."""
        return self._client.post(url, **kwargs)

    def put(self, url: str, **kwargs) -> httpx.Response:
        """Make a PUT request."""
        return self._client.put(url, **kwargs)

    def patch(self, url: str, **kwargs) -> httpx.Response:
        """Make a PATCH request."""
        return self._client.patch(url, **kwargs)

    def delete(self, url: str, **kwargs) -> httpx.Response:
        """Make a DELETE request."""
        return self._client.delete(url, **kwargs)

    def close(self):
        """Close the client."""
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


class Client(BaseClient):
    """HTTP client using httpx (alias for BaseClient)."""

    pass


def create_client(base_url: Optional[str] = None, **kwargs) -> Client:
    """Create a new HTTP client instance."""
    return Client(base_url=base_url, **kwargs)
