# done:
* poc entity view
* poc filter
* add git repository
* add docker compose
* push to new server
* create a copy of the db for the docker
* add auth
* auth - https://www.codemag.com/Article/2001081/Nest.js-Step-by-Step-Part-3-Users-and-Authentication
* remove show components
* add base components for list, edit & create
* fix custom referencing tables
* hebrew translation
* add admin role
* add admin wrapper
* rtl support - https://marmelab.com/react-admin/Theming.html
* fix crud auth filter
* add permissions
* add multi login for same user support - by add a column of 'effective user id' and using it to filter the results
* use vite for client
* add yemot controller
* add yemot simulator
* split yemot common & specific logic
* test user add
* test all table edit & add
* hangup a simulator after finish
* add dashboard stats
* check dashboard error
* fix reference input
* use npm package for common logic in client
* move to git sub modules
* fix quick filter
* use git submodule for common logic in server
* update dashboard ui
* use cookie instead of auth bearer
* don't use path ../ anywhere, use src/ instead
* import - https://stackoverflow.com/questions/72488424/upload-excel-data-into-database-using-nestjs
* import csv - https://www.npmjs.com/package/react-admin-import-csv?activeTab=readme https://www.npmjs.com/package/ra-import-csv
* add csv import
* organize client shared components folder
* join limitaion -  https://github.com/typeorm/typeorm/issues/1668
* export - try to add joins
* translate excel file name
* check how to download excel from response & use fetchJson func - use blob maybe
* export - implement pdf export - copy template from old website and use it to render pdf
* export pdf - https://stackoverflow.com/questions/64964827/nestjs-exporting-library-to-pdf-or-excel
https://github.com/tinovyatkin/nest-puppeteer
* add export to csv & pdf
* validate dns is pointing to ip address
* add domain name to site
* try to use caddy-docker-proxy - https://hub.docker.com/r/lucaslorentz/caddy-docker-proxy
* simplify docker compose file - why override domain everywhere?
* export base64 string to support netfree
* add csv & pdf options to export button
* handle date format in export
* make excel file look better
* make pdf file look better
* add a loader to export button
* fix rtl - https://mui.com/material-ui/guides/right-to-left/
* rtl in autocomplete
* maybe use dynamic modules or some other thing so we won't need to override every single function
* json-viewer for user permission & additional data - https://www.npmjs.com/package/react-admin-json-view?activeTab=readme
* https://marmelab.com/react-admin/Admin.html#title
* add export header names to all tables
* add filters - https://marmelab.com/react-admin/FilteringTutorial.html
* student klass report - QueryFailedError: Access denied for user 'user'@'%' (using password: YES)
* fix joining errors
* fix lessons.klasses text-align
* add student base klass view
* test filter by student base klass
* add years in all tables - check if can use null values
* import from email
* move import & export to a utils folder
* make student klass repot & sudent base klass generic
* make year column nullable
* use multi reference field
* add typeorm migration - all foreign keys are using id
* update in reference input
* add audit log - full preview of item instead of soft delete
* soft delete - https://github.com/nestjsx/crud/issues/433
* validate exports are working after change
* add support for order by of names
* לצרף את הטבלה רק אם היא מופיעה במיון
* save import file data in a table
* add get, post, put, delete function to data provider
* define a table for 'audit-log' & 'import-file' data
* update react admin version
* להוסיף רשימת קבצים שהועלו
* add yemot call module to dynamic modules
* enable reverting for imported file
* logs
* add sign up form
* update code-server
* test send mails
* self host n8n
* add mail addresses table
* add mail update n8n workflow
* add mail recieve in n8n
* add mail fallback in n8n
* לשפר תהליך טלפוני- לנסות לשים שם את התהליך הטלפוני של מאיר
* add recieve email webhook
* להוסיף אפשרות לבחור כתובות מייל
* add validation for mail address - also across domains
* update react admin
* update data-ui/crud version and use request.auth instead of injecting user data
* create github actions workflow
* check the use of request_parser.extra property
* fix error on importing file - field fileSource doesnt have a default value
* check why prod code is not updating - the files are updated, but the runnng code is the old code, proved by logs, only after deleting the containers his is fixed
* add json to report generators
* rename 'reportDefinition' to 'reportGenerator'
* simplify getReportData function from base-entity.service
* make student grade report work
* support multiple report generation at once - add buffer to pdf generator
* make student report card work for multiple selected ids
* add mail server for sending & receiving - https://docs.postalserver.io/
* rate limit backend requests
* use id column for relation everywhere
* support multiple report generation at once - add buffer to pdf generator
* add userId filter for admin user in all tables
* add user info fields to register form - שם, פלאפון מייל, שם המוסד, כתובת המוסד, טלפון המוסד. תפקיד
* translate all tables - including admin
* update date fields format
* search google how to send response mail with smtp server
* add permission to users table to shifi
* remove delete button from mail address list and users table for simple users
* make export function only one with extra.format for the format
* add api webhook for pivot - with support for more than one
* add subroute for students for pivot
* add explanation how to configure yemot phone to connect to the system
* add swagger - https://docs.nestjs.com/openapi/introduction
* rename id_copy1 to updated_at
* show pages data in a special page - in accordion
* check why updated_at column not updating
* render dynamic columns - student pivot - https://stackoverflow.com/questions/59321237/how-to-render-dynamic-fields-on-list-component-of-react-admin
* make sure class-validator works properly
* add class-validator to every entity
* add client side validation to every entity
* add BeforeUpdate to each BeforeInsert
* update pages - add order, order by order, add permission to add new page

# todo
* check why backend container at docker is not updated
* tranlate class-validator errors - https://github.com/typestack/class-validator/issues/169
* check what happens when email import is failing class-validator
* add unique validator for mail address uniqueness - https://github.com/typestack/class-validator#custom-validation-decorators https://stackoverflow.com/questions/75660359/how-to-add-unique-field-validation-in-nest-js-with-class-validator 
* add logs for each request - https://www.npmjs.com/package/nestjs-pino
* re-run migration scripts (referenceId) for demo.yoman.online
* add analytics to check popular pages and buttons
* user that didnt pay can't export any data - pdf or excel, can't download bulk report
* add to users table payment isPaid & payment method inputs
* add to users table mail address alias & title from which will send emails
* add report filters popup to bulk report button
* hide month data from att_report - should not be used
* add new table - for report months - will have name, start date, end date
* new report for teachers report - teacher, month, sent lessons, not sent lessons
* the new report will have button to send email to teacher
* a new popup will be opened to edit the email message, with default value. mail subject will be in text table. 
* add send excel file to teacher in new teacher report
* add filters to student attendance pivot
* add the ability to export pivot
* add 'impersonate' logic, impersonate button at users table, impersonate api in auth service, allow only for admins, in user data keep the data that it is impersonated, and on logout return admin user, save previousUserId on the jwt token and use it on impersonate end
* add option to self connect to yemot phone
* add images table so users can edit images for reports
* add user image to export pdf file
* better text management in db - no need to daclare each text so many times
SELECT b.key AS base_key, b.value AS base_value, o.id, o.key AS override_key, o.value AS override_value
FROM base_texts b
LEFT JOIN overrides o ON b.key = o.key AND o.user_id = 1;
* nest auto delete migration files
* create a table of 'payment tracks'
* להכין מסמך בסיס לתמחור
חבילה בסיסית בחינם
שאר החבילות - תמחור לפי כמות תלמידות
תוספת מחיר לפי משתמשים
מחיר שקוף - יופיע באתר
* check docker security issues - change to use docker swarm for production
* fix yemot simulator with lesson confirm
* split report generators to different files - one for each generator - maybe
* add menu grouping
* implement todos in dashboard item
* 

# todo later
* להציג את השיחות של ימות המשיח בצורה יפה
* add settings & profile page
* add ability to edit report templates
* add gzip to caddy
* change to typescript on client side
* add custom prefix to common components
* https://github.com/bigbasket/ra-components
* date-time inputs https://www.npmjs.com/package/react-admin-date-inputs-refactor?activeTab=readme https://www.npmjs.com/package/@mpampin/react-admin-date-inputs https://www.npmjs.com/package/@sklinet/react-admin-date-inputs?activeTab=readme https://www.npmjs.com/package/react-admin-date-picker?activeTab=readme https://www.npmjs.com/package/react-admin-material-datepicker?activeTab=readme
* permissions - https://www.npmjs.com/package/@blackbox-vision/ra-rbac
* improve nestjs = https://wanago.io/2021/05/03/api-nestjs-cpu-intensive-tasks-queues/
* add compact ui - https://github.com/ValentinnDimitroff/ra-compact-ui
* add unit testing
* add complex queries
* rich text editor - https://www.npmjs.com/package/ra-richtext-tiptap https://www.npmjs.com/package/ra-input-rich-text?activeTab=readme
* clipboard - https://www.npmjs.com/package/react-admin-clipboard-list-field
* 