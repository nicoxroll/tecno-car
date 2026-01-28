insert into public.site_config (key, value)
values ('ai_chat_enabled', 'true')
on conflict (key) do nothing;