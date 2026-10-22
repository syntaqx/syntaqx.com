+++
title = "Forms & Validation"
description = "Native inputs first, validation that waits until people are done, server errors mapped onto fields, accessible error messages, and forms that never lose work."
category = "Frontend"
order = 13.3
tags = ["forms", "validation", "accessibility", "frontend"]
+++

Forms are where users give you something: their money, their data, their time. Every failure mode of a form costs that back. A field that rejects valid input, an error that doesn't say what's wrong, a submit that wipes what someone typed: each one turns a user who wanted to finish into one who gives up. Most of what follows is about not punishing people for the gap between what they entered and what the system expected.

## Native HTML First

The browser already knows a lot about forms, and every piece it handles is one you don't build, test or get wrong.

- **A visible `<label>` for every input,** connected with `for`/`id`. Clicking the label focuses the field, screen readers announce it, and it's still there after the user starts typing, which a placeholder isn't.
- **The right `type`.** `email`, `tel`, `url` and `number` change the mobile keyboard, so the person typing a phone number gets a keypad instead of a full keyboard. That's a usability win for one attribute.
- **`autocomplete` with real tokens.** `name`, `given-name`, `email`, `tel`, `street-address`, `postal-code`, `cc-number`, `one-time-code`, `current-password`, `new-password` and the rest are defined by the [HTML standard](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html) and let the browser fill a whole checkout in one tap. Getting them wrong, or turning them `off`, makes people retype what their browser already knows. On login fields, most browsers ignore `autocomplete="off"` anyway so that password managers keep working ([MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete)).
- **Constraint attributes** (`required`, `minlength`, `pattern`, `min`, `max`) give you [constraint validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation) and the `:invalid` state for free. They describe the rules in the markup, where the next engineer will find them.

## When to Validate

Validating on every keystroke tells people they're wrong while they're still typing. "Invalid email" appears after the first letter of every address anyone has ever entered. It's noise at best and alarming at worst, and it trains people to ignore the messages that come later.

I validate when the person has finished: on submit, and optionally when they leave a field they've already corrected once. The [GOV.UK Design System](https://design-system.service.gov.uk/patterns/validation/), built on years of research with people who aren't comfortable online, goes further and validates only on submit, allowing inline feedback only where research shows it helps more than it hurts. The exception is feedback that guides rather than judges: a character count approaching a limit, or password strength while someone chooses one.

## The Server Is the Source of Truth

Client-side validation is a courtesy. It gives fast feedback for the obvious cases, but anyone can bypass it, and the client can't know everything: whether the email is already registered, whether the coupon expired a minute ago, whether the inventory is still there. The server validates everything, every time.

That means the form has to handle server errors as a first-class path, not an afterthought. The API returns field-level failures as a `422` with an `errors` object keyed by field ([Error Responses](/docs/requests/error-responses)):

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["An account with this email already exists."],
    "address.postal_code": ["The postal code doesn't match the city."]
  }
}
```

The form maps each key onto its field and shows the message there, exactly as it would for a client-side error. The user shouldn't be able to tell which side caught the problem. A `400` (malformed request) or a `5xx` isn't about any field, so it goes in a form-level message instead. This is why the API's error shape matters to the frontend: a consistent `errors` object means one piece of form code handles every endpoint.

## Error Messages That Fix the Problem

An error message has one job: get the person to a valid submission. "Invalid input" fails that job. "Enter a date in the format 31/12/2026" does it.

- **Say what's wrong and how to fix it,** in the person's terms, not the system's. "The card number is too short: it should be 16 digits", not "Validation failed: pan.length".
- **Don't blame.** "Enter your postcode" beats "You didn't enter a postcode".
- **Be specific to the field and the rule** that failed. One generic message per field hides which of three rules was broken.

WCAG makes the first two requirements: errors must be identified and described in text ([3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)), and where a correction is known it should be suggested ([3.3.3](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)).

## Accessible Errors

A red border tells sighted users something is wrong. It tells nobody else anything.

- **Text, not just color.** Every error has a message, ideally with an icon too, so it doesn't rely on color alone ([Accessibility](/docs/frontend/accessibility)).
- **Attach the message to its field** with `aria-describedby`, so a screen reader announces it when the field gets focus, and mark the field with `aria-invalid="true"` ([MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid)).
- **After a failed submit, move focus.** For a long form, show an error summary at the top that links to each field, and move focus to it. For a short one, focus the first invalid field. Either way, a keyboard or screen reader user lands where the problem is instead of at a submit button that silently did nothing. GOV.UK's [error summary](https://design-system.service.gov.uk/components/error-summary/) is a well-tested version of the pattern, and it also prefixes the page title with "Error:" so the problem is announced immediately.

## Never Lose Work

The most expensive form bug is the one that clears the form. Someone spent ten minutes on an application, one field fails validation, and they're back to blank fields.

- **Keep every value on failure,** client-side and server-side. Re-render the form with what was submitted.
- **Don't make people re-enter what they already gave you** in the same flow ([WCAG 3.3.7, Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)). Carry the shipping address into billing with a checkbox, not a retype.
- **Save drafts of long forms** locally or on the server as people go, so a crash, an expired session or a closed tab doesn't erase their work.
- **Split long forms into steps** with one topic each, and let people go back without losing later answers. Steps reduce how much anyone has to hold in their head, and they localize errors to a single page.

## Double Submits

People double-click. Networks drop the response after the server did the work, and users click again. If submitting creates something (an order, a payment, a ticket), two clicks can create two of it.

Disabling the button while a submit is in flight handles the double click, but not the retry after a lost response, which is the case that actually charges cards twice. The robust fix is server-side: generate an [idempotency key](/docs/payments/idempotency) when the form is first shown, send it with every submit attempt, and let the server return the original result for a repeat. The button state is a courtesy; the key is the guarantee.

## Password Managers and Paste

Blocking paste on password fields, or breaking autofill with unusual markup, pushes people toward short passwords they can type from memory, which is the opposite of what the restriction intends. NIST's [digital identity guidelines](https://pages.nist.gov/800-63-4/sp800-63b.html) say verifiers SHALL allow password managers and autofill and SHOULD permit paste, and WCAG 2.2's [Accessible Authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html) criterion treats paste and password managers as the way to avoid making people memorize or transcribe anything.

Use `autocomplete="current-password"` on sign-in and `new-password` on sign-up and password changes, so managers know whether to fill an existing password or generate a new one. The same goes for one-time codes: `autocomplete="one-time-code"` lets the platform offer the code from an SMS without the user switching apps.

## This Site

The site has no account forms, but the API reference's "Try it" console follows the same rules for its request form: every parameter has a visible label, the request body is checked as JSON before sending with a message that says what's wrong ("Body isn't valid JSON: …"), and a failed request leaves everything the user entered in place so they can fix it and send again.

## References

**Specifications**

- [WHATWG: HTML, Autofill](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html), the autocomplete tokens and how browsers use them
- [W3C: Understanding WCAG 2.2, Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), errors described in text
- [W3C: Understanding WCAG 2.2, Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html), suggesting how to fix an error
- [W3C: Understanding WCAG 2.2, Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html), not asking for the same information twice
- [W3C: Understanding WCAG 2.2, Accessible Authentication (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html), paste and password managers in sign-in
- [NIST SP 800-63B: Authentication and Authenticator Management](https://pages.nist.gov/800-63-4/sp800-63b.html), allowing password managers, autofill and paste

**Reference**

- [MDN: autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete), token list and browser behavior on login fields
- [MDN: Constraint validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation), built-in validation attributes and states
- [MDN: aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid), marking a field as invalid
- [MDN: aria-describedby](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby), connecting an error message to its field
- [W3C WAI: Forms tutorial, user notifications](https://www.w3.org/WAI/tutorials/forms/notifications/), accessible success and error notifications

**In practice**

- [GOV.UK Design System: Validation](https://design-system.service.gov.uk/patterns/validation/), validating on submit and keeping what users entered
- [GOV.UK Design System: Error summary](https://design-system.service.gov.uk/components/error-summary/), the summary, focus management and the "Error:" title prefix
- [web.dev: Sign-in form best practices](https://web.dev/articles/sign-in-form-best-practices), autocomplete and password manager friendly markup
