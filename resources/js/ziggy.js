/* eslint-disable */
// @ts-nocheck
const Ziggy = {
    url: 'http:\/\/localhost:8000',
    port: 8000,
    defaults: {},
    routes: {
        'boost.browser-logs': {
            uri: '_boost\/browser-logs',
            methods: ['POST'],
        },
        login: { uri: 'login', methods: ['GET', 'HEAD'] },
        'login.store': { uri: 'login', methods: ['POST'] },
        logout: { uri: 'logout', methods: ['POST'] },
        'password.request': {
            uri: 'forgot-password',
            methods: ['GET', 'HEAD'],
        },
        'password.reset': {
            uri: 'reset-password\/{token}',
            methods: ['GET', 'HEAD'],
            parameters: ['token'],
        },
        'password.email': { uri: 'forgot-password', methods: ['POST'] },
        'password.update': { uri: 'reset-password', methods: ['POST'] },
        register: { uri: 'register', methods: ['GET', 'HEAD'] },
        'register.store': { uri: 'register', methods: ['POST'] },
        'verification.notice': {
            uri: 'email\/verify',
            methods: ['GET', 'HEAD'],
        },
        'verification.verify': {
            uri: 'email\/verify\/{id}\/{hash}',
            methods: ['GET', 'HEAD'],
            parameters: ['id', 'hash'],
        },
        'verification.send': {
            uri: 'email\/verification-notification',
            methods: ['POST'],
        },
        'password.confirm': {
            uri: 'user\/confirm-password',
            methods: ['GET', 'HEAD'],
        },
        'password.confirmation': {
            uri: 'user\/confirmed-password-status',
            methods: ['GET', 'HEAD'],
        },
        'password.confirm.store': {
            uri: 'user\/confirm-password',
            methods: ['POST'],
        },
        'two-factor.login': {
            uri: 'two-factor-challenge',
            methods: ['GET', 'HEAD'],
        },
        'two-factor.login.store': {
            uri: 'two-factor-challenge',
            methods: ['POST'],
        },
        'two-factor.enable': {
            uri: 'user\/two-factor-authentication',
            methods: ['POST'],
        },
        'two-factor.confirm': {
            uri: 'user\/confirmed-two-factor-authentication',
            methods: ['POST'],
        },
        'two-factor.disable': {
            uri: 'user\/two-factor-authentication',
            methods: ['DELETE'],
        },
        'two-factor.qr-code': {
            uri: 'user\/two-factor-qr-code',
            methods: ['GET', 'HEAD'],
        },
        'two-factor.secret-key': {
            uri: 'user\/two-factor-secret-key',
            methods: ['GET', 'HEAD'],
        },
        'two-factor.recovery-codes': {
            uri: 'user\/two-factor-recovery-codes',
            methods: ['GET', 'HEAD'],
        },
        'two-factor.regenerate-recovery-codes': {
            uri: 'user\/two-factor-recovery-codes',
            methods: ['POST'],
        },
        home: { uri: '\/', methods: ['GET', 'HEAD'] },
        dashboard: { uri: 'dashboard', methods: ['GET', 'HEAD'] },
        'dashboard.preferences.update': {
            uri: 'dashboard\/preferences',
            methods: ['POST'],
        },
        'clients.index': { uri: 'clients', methods: ['GET', 'HEAD'] },
        'clients.create': { uri: 'clients\/create', methods: ['GET', 'HEAD'] },
        'clients.store': { uri: 'clients', methods: ['POST'] },
        'clients.show': {
            uri: 'clients\/{client}',
            methods: ['GET', 'HEAD'],
            parameters: ['client'],
            bindings: { client: 'id' },
        },
        'clients.edit': {
            uri: 'clients\/{client}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['client'],
        },
        'clients.update': {
            uri: 'clients\/{client}',
            methods: ['PUT', 'PATCH'],
            parameters: ['client'],
            bindings: { client: 'id' },
        },
        'clients.destroy': {
            uri: 'clients\/{client}',
            methods: ['DELETE'],
            parameters: ['client'],
            bindings: { client: 'id' },
        },
        'clients.bulk-update': {
            uri: 'clients\/bulk-update',
            methods: ['POST'],
        },
        'clients.custom-fields.update': {
            uri: 'clients\/{client}\/custom-fields',
            methods: ['POST'],
            parameters: ['client'],
            bindings: { client: 'id' },
        },
        'tags.store': { uri: 'tags', methods: ['POST'] },
        'tags.destroy': {
            uri: '{taggableType}\/{taggableId}\/tags\/{tag}',
            methods: ['DELETE'],
            parameters: ['taggableType', 'taggableId', 'tag'],
            bindings: { tag: 'id' },
        },
        'clients.activities.store': {
            uri: 'clients\/{client}\/activities',
            methods: ['POST'],
            parameters: ['client'],
            bindings: { client: 'id' },
        },
        'activities.update': {
            uri: 'activities\/{activity}',
            methods: ['PATCH'],
            parameters: ['activity'],
            bindings: { activity: 'id' },
        },
        'activities.destroy': {
            uri: 'activities\/{activity}',
            methods: ['DELETE'],
            parameters: ['activity'],
            bindings: { activity: 'id' },
        },
        'reminders.complete': {
            uri: 'reminders\/{reminder}\/complete',
            methods: ['PUT'],
            parameters: ['reminder'],
            bindings: { reminder: 'id' },
        },
        'reminders.snooze': {
            uri: 'reminders\/{reminder}\/snooze',
            methods: ['PUT'],
            parameters: ['reminder'],
            bindings: { reminder: 'id' },
        },
        'reminders.bulk-action': {
            uri: 'reminders\/bulk-action',
            methods: ['POST'],
        },
        'reminders.index': { uri: 'reminders', methods: ['GET', 'HEAD'] },
        'reminders.create': {
            uri: 'reminders\/create',
            methods: ['GET', 'HEAD'],
        },
        'reminders.store': { uri: 'reminders', methods: ['POST'] },
        'reminders.show': {
            uri: 'reminders\/{reminder}',
            methods: ['GET', 'HEAD'],
            parameters: ['reminder'],
        },
        'reminders.edit': {
            uri: 'reminders\/{reminder}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['reminder'],
        },
        'reminders.update': {
            uri: 'reminders\/{reminder}',
            methods: ['PUT', 'PATCH'],
            parameters: ['reminder'],
            bindings: { reminder: 'id' },
        },
        'reminders.destroy': {
            uri: 'reminders\/{reminder}',
            methods: ['DELETE'],
            parameters: ['reminder'],
            bindings: { reminder: 'id' },
        },
        'projects.index': { uri: 'projects', methods: ['GET', 'HEAD'] },
        'projects.store': { uri: 'projects', methods: ['POST'] },
        'projects.show': {
            uri: 'projects\/{project}',
            methods: ['GET', 'HEAD'],
            parameters: ['project'],
            bindings: { project: 'id' },
        },
        'projects.update': {
            uri: 'projects\/{project}',
            methods: ['PUT', 'PATCH'],
            parameters: ['project'],
            bindings: { project: 'id' },
        },
        'projects.destroy': {
            uri: 'projects\/{project}',
            methods: ['DELETE'],
            parameters: ['project'],
            bindings: { project: 'id' },
        },
        'tasks.store': { uri: 'tasks', methods: ['POST'] },
        'tasks.update': {
            uri: 'tasks\/{task}',
            methods: ['PATCH'],
            parameters: ['task'],
            bindings: { task: 'id' },
        },
        'tasks.toggle-complete': {
            uri: 'tasks\/{task}\/toggle-complete',
            methods: ['PUT'],
            parameters: ['task'],
            bindings: { task: 'id' },
        },
        'tasks.reorder': { uri: 'tasks\/reorder', methods: ['POST'] },
        'tasks.bulk-complete': {
            uri: 'tasks\/bulk-complete',
            methods: ['POST'],
        },
        'tasks.destroy': {
            uri: 'tasks\/{task}',
            methods: ['DELETE'],
            parameters: ['task'],
            bindings: { task: 'id' },
        },
        'projects.updates.store': {
            uri: 'projects\/{project}\/updates',
            methods: ['POST'],
            parameters: ['project'],
            bindings: { project: 'id' },
        },
        'attachments.download': {
            uri: 'attachments\/{attachment}\/download',
            methods: ['GET', 'HEAD'],
            parameters: ['attachment'],
            bindings: { attachment: 'id' },
        },
        'notifications.mark-as-read': {
            uri: 'notifications\/mark-as-read',
            methods: ['POST'],
        },
        'notifications.mark-one-as-read': {
            uri: 'notifications\/{id}\/mark-as-read',
            methods: ['POST'],
            parameters: ['id'],
        },
        'profile.edit': { uri: 'settings\/profile', methods: ['GET', 'HEAD'] },
        'profile.update': { uri: 'settings\/profile', methods: ['PATCH'] },
        'profile.destroy': { uri: 'settings\/profile', methods: ['DELETE'] },
        'user-password.edit': {
            uri: 'settings\/password',
            methods: ['GET', 'HEAD'],
        },
        'user-password.update': { uri: 'settings\/password', methods: ['PUT'] },
        'appearance.edit': {
            uri: 'settings\/appearance',
            methods: ['GET', 'HEAD'],
        },
        'two-factor.show': {
            uri: 'settings\/two-factor',
            methods: ['GET', 'HEAD'],
        },
        'storage.local': {
            uri: 'storage\/{path}',
            methods: ['GET', 'HEAD'],
            wheres: { path: '.*' },
            parameters: ['path'],
        },
    },
};
if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export { Ziggy };
