# df clicker

a minimal example dartfrog app.

dartfrog is a suite of tools for kinode apps.

clicker uses the rust crate `dartfrog_lib` and npm module `puddle` to create a simple dartfrog app.

to create your own dartfrog app, you could fork this repo and do a whole lot of manual renaming "clicker" to "your app name" and then just a small amount of actual code to create the app.

I plan to create a template from this and a dev tool similar to `kit new`.

### the code
almost all of the meaningful code is in just a few files. look there to see how the app works:


#### backend
* [df_clicker/src/lib.rs](df_clicker/src/lib.rs)

#### frontend
* [ui/src/store/clicker.ts](ui/src/store/clicker.ts)
* [ui/src/components/ClickerPluginBox.tsx](ui/src/components/ClickerPluginBox.tsx)

### the dartfrog part
df-clicker uses dartfrog for chat, user profiles, user presence, app links (e.g. `df://clicker-hub:fake.dev@df-clicker:df-clicker:herobrine.os`), and more.




