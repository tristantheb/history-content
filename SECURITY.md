# Security Policy

Thank you for helping keep this project secure. This document explains how to report security vulnerabilities and what we expect from contributors.

## Reporting a Vulnerability

- Do not open a public issue for security-sensitive information.
- Preferred: Use the private GitHub reporting feature for security vulnerabilities.

## Sensitive Data and Encryption

- If you must send secrets or exploit code by email, encrypt using the project's public PGP key. If no key is published, use the GitHub Security Advisory workflow instead.
- Do not post secrets (API keys, passwords, private keys) in Git history, issues, or pull requests.

## Responsible Disclosure

- We aim to acknowledge reports within 5 days and coordinate a fix timeline with the reporter.
- We ask reporters to give us a reasonable period to investigate and patch before public disclosure.

## Contributor Expectations

- Scan changes for secrets before committing.
- Write clear, minimal reproductions for security-related PRs.
- Avoid committing credentials, tokens, or other sensitive data to the repository.

## After a Fix

- We will coordinate disclosure and, if appropriate, credit the reporter unless they prefer anonymity.
- Fixes will be released according to our normal release process; urgent patches may be backported as needed.
- Security advisories will be published in accordance with GitHub's security advisory process.
