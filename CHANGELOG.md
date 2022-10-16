#### 2.0.3 (2022-10-16)
 - Introduced context analysis but isn't exposed to the client yet.
  ^ this is to avoid any accidental breakdowns caused by bugged/broken code;
    the context analysis is still in development and will be exposed to the client at a later date after local/remote testing has been completed.

## 2.0.2 (2022-10-15)
 - Created: `src/routes/home/classes/baseRoutes.ts`
 - Updated: `src/routes/home/base.ts`

#### Details:
 - Created a class to handle the routes of the home path, under-the-hood, although this isn't finished, it's the concept idea.
 -  The update will return the Routes available to the API with a short description on what each path does.