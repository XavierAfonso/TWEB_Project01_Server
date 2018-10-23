const fetch = require('node-fetch');

class ResponseError extends Error {
  constructor(res, body) {
    super(`${res.status} error requesting ${res.url}: ${res.statusText}`);
    this.status = res.status;
    this.path = res.url;
    this.body = body;
  }
}

class Github {
  constructor({ token, baseUrl = 'https://api.github.com' } = {}) {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  setToken(token) {
    this.token = token;
  }

  request(path, opts = {}) {
    const url = `${this.baseUrl}${path}`;
    const options = {
      ...opts,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${this.token}`,
      },
    };

    return fetch(url, options)
      .then(res => res.json()
        .then((data) => {
          if (!res.ok) {
            throw new ResponseError(res, data);
          }
          return data;
        }));
  }

  // Get JSON content of a user
  user(username) {
    return this.request(`/users/${username}`);
  }

  // Get a JSON of the all repos of the given user
  repos(username) {
    return this.request(`/users/${username}/repos`);
  }

  // Get a JSON of the language(s) of the given repo
  repoLanguages(repoName) {
    return this.request(`/repos/${repoName}/languages`);
  }

  // Get a JSON of all the contributers of the given repo
  repoContributors(repoFullName) {
    return this.request(`/repos/${repoFullName}/contributors`)
      .catch(() => []); // If is not a json
  }

  // Get a JSON of all unique contributors in all repos of a user
  reposContributors(username) {
    return this.repos(username)
      .then((repos) => {
        const getContributors = repo => this.repoContributors(repo.full_name);
        return Promise.all(repos.map(getContributors));
      });
  }

  // Get a JSON all langages used in the repos of a user
  userLanguages(username) {
    return this.repos(username)
      .then((repos) => {
        const getLanguages = repo => this.repoLanguages(repo.full_name);
        return Promise.all(repos.map(getLanguages));
      });
  }
}

module.exports = Github;
