CREATE OR REPLACE FUNCTION public.colabx_rename_column_if_exists(
    p_table text,
    p_old text,
    p_new text
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = p_table
          AND column_name = p_old
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = p_table
          AND column_name = p_new
    ) THEN
        EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', p_table, p_old, p_new);
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.colabx_rename_constraint_if_exists(
    p_table text,
    p_old text,
    p_new text
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = p_table
          AND c.conname = p_old
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = p_table
          AND c.conname = p_new
    ) THEN
        EXECUTE format('ALTER TABLE %I RENAME CONSTRAINT %I TO %I', p_table, p_old, p_new);
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.colabx_rename_index_if_exists(
    p_old text,
    p_new text
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    IF to_regclass(format('public.%I', p_old)) IS NOT NULL
       AND to_regclass(format('public.%I', p_new)) IS NULL THEN
        EXECUTE format('ALTER INDEX %I.%I RENAME TO %I', 'public', p_old, p_new);
    END IF;
END
$$;

-- Primary keys
SELECT public.colabx_rename_column_if_exists('organization', 'id', 'organizationId');
SELECT public.colabx_rename_column_if_exists('orgUser', 'id', 'orgUserId');
SELECT public.colabx_rename_column_if_exists('invitation', 'id', 'invitationId');
SELECT public.colabx_rename_column_if_exists('partner', 'id', 'partnerId');
SELECT public.colabx_rename_column_if_exists('contact', 'id', 'contactId');
SELECT public.colabx_rename_column_if_exists('team', 'id', 'teamId');
SELECT public.colabx_rename_column_if_exists('teamMember', 'id', 'teamMemberId');
SELECT public.colabx_rename_column_if_exists('teamPartner', 'id', 'teamPartnerId');
SELECT public.colabx_rename_column_if_exists('deal', 'id', 'dealId');
SELECT public.colabx_rename_column_if_exists('dealAssignment', 'id', 'dealAssignmentId');
SELECT public.colabx_rename_column_if_exists('dealMessage', 'id', 'dealMessageId');
SELECT public.colabx_rename_column_if_exists('dealTask', 'id', 'dealTaskId');
SELECT public.colabx_rename_column_if_exists('dealDocument', 'id', 'dealDocumentId');
SELECT public.colabx_rename_column_if_exists('objective', 'id', 'objectiveId');
SELECT public.colabx_rename_column_if_exists('keyResult', 'id', 'keyResultId');
SELECT public.colabx_rename_column_if_exists('communication', 'id', 'communicationId');
SELECT public.colabx_rename_column_if_exists('document', 'id', 'documentId');
SELECT public.colabx_rename_column_if_exists('activityLog', 'id', 'activityLogId');
SELECT public.colabx_rename_column_if_exists('notification', 'id', 'notificationId');

-- Organization ownership columns
SELECT public.colabx_rename_column_if_exists('orgUser', 'orgId', 'organizationId');
SELECT public.colabx_rename_column_if_exists('invitation', 'orgId', 'organizationId');
SELECT public.colabx_rename_column_if_exists('partner', 'orgId', 'organizationId');
SELECT public.colabx_rename_column_if_exists('contact', 'orgId', 'organizationId');
SELECT public.colabx_rename_column_if_exists('team', 'orgId', 'organizationId');
SELECT public.colabx_rename_column_if_exists('deal', 'orgId', 'organizationId');
SELECT public.colabx_rename_column_if_exists('objective', 'orgId', 'organizationId');
SELECT public.colabx_rename_column_if_exists('communication', 'orgId', 'organizationId');
SELECT public.colabx_rename_column_if_exists('document', 'orgId', 'organizationId');
SELECT public.colabx_rename_column_if_exists('activityLog', 'orgId', 'organizationId');
SELECT public.colabx_rename_column_if_exists('notification', 'orgId', 'organizationId');

-- User ownership columns
SELECT public.colabx_rename_column_if_exists('partner', 'createdBy', 'createdByUserId');
SELECT public.colabx_rename_column_if_exists('contact', 'createdBy', 'createdByUserId');
SELECT public.colabx_rename_column_if_exists('team', 'createdBy', 'createdByUserId');
SELECT public.colabx_rename_column_if_exists('deal', 'createdBy', 'createdByUserId');
SELECT public.colabx_rename_column_if_exists('dealTask', 'createdBy', 'createdByUserId');
SELECT public.colabx_rename_column_if_exists('objective', 'createdBy', 'createdByUserId');
SELECT public.colabx_rename_column_if_exists('document', 'uploadedBy', 'uploadedByUserId');
SELECT public.colabx_rename_column_if_exists('dealDocument', 'uploadedBy', 'uploadedByUserId');
SELECT public.colabx_rename_column_if_exists('communication', 'senderId', 'senderUserId');
SELECT public.colabx_rename_column_if_exists('dealMessage', 'senderId', 'senderUserId');
SELECT public.colabx_rename_column_if_exists('notification', 'recipientId', 'recipientUserId');
SELECT public.colabx_rename_column_if_exists('teamPartner', 'assignedBy', 'assignedByUserId');

-- Constraint renames
SELECT public.colabx_rename_constraint_if_exists(
    'invitation',
    'invitation_orgId_organization_id_fk',
    'invitation_organizationId_organization_organizationId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'orgUser',
    'orgUser_orgId_organization_id_fk',
    'orgUser_organizationId_organization_organizationId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'team',
    'team_orgId_organization_id_fk',
    'team_organizationId_organization_organizationId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'team',
    'team_createdBy_user_id_fk',
    'team_createdByUserId_user_id_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'teamMember',
    'teamMember_teamId_team_id_fk',
    'teamMember_teamId_team_teamId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'partner',
    'partner_orgId_organization_id_fk',
    'partner_organizationId_organization_organizationId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'partner',
    'partner_createdBy_user_id_fk',
    'partner_createdByUserId_user_id_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'deal',
    'deal_orgId_organization_id_fk',
    'deal_organizationId_organization_organizationId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'deal',
    'deal_partnerId_partner_id_fk',
    'deal_partnerId_partner_partnerId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'deal',
    'deal_teamId_team_id_fk',
    'deal_teamId_team_teamId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'deal',
    'deal_createdBy_user_id_fk',
    'deal_createdByUserId_user_id_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'dealAssignment',
    'dealAssignment_dealId_deal_id_fk',
    'dealAssignment_dealId_deal_dealId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'dealMessage',
    'dealMessage_dealId_deal_id_fk',
    'dealMessage_dealId_deal_dealId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'dealMessage',
    'dealMessage_senderId_user_id_fk',
    'dealMessage_senderUserId_user_id_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'dealTask',
    'dealTask_dealId_deal_id_fk',
    'dealTask_dealId_deal_dealId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'dealTask',
    'dealTask_createdBy_user_id_fk',
    'dealTask_createdByUserId_user_id_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'dealDocument',
    'dealDocument_dealId_deal_id_fk',
    'dealDocument_dealId_deal_dealId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'dealDocument',
    'dealDocument_uploadedBy_user_id_fk',
    'dealDocument_uploadedByUserId_user_id_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'objective',
    'objective_orgId_organization_id_fk',
    'objective_organizationId_organization_organizationId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'objective',
    'objective_partnerId_partner_id_fk',
    'objective_partnerId_partner_partnerId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'objective',
    'objective_teamId_team_id_fk',
    'objective_teamId_team_teamId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'objective',
    'objective_createdBy_user_id_fk',
    'objective_createdByUserId_user_id_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'keyResult',
    'keyResult_objectiveId_objective_id_fk',
    'keyResult_objectiveId_objective_objectiveId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'communication',
    'communication_orgId_organization_id_fk',
    'communication_organizationId_organization_organizationId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'communication',
    'communication_partnerId_partner_id_fk',
    'communication_partnerId_partner_partnerId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'communication',
    'communication_senderId_user_id_fk',
    'communication_senderUserId_user_id_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'document',
    'document_orgId_organization_id_fk',
    'document_organizationId_organization_organizationId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'document',
    'document_partnerId_partner_id_fk',
    'document_partnerId_partner_partnerId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'document',
    'document_uploadedBy_user_id_fk',
    'document_uploadedByUserId_user_id_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'activityLog',
    'activityLog_orgId_organization_id_fk',
    'activityLog_organizationId_organization_organizationId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'teamPartner',
    'teamPartner_teamId_team_id_fk',
    'teamPartner_teamId_team_teamId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'teamPartner',
    'teamPartner_partnerId_partner_id_fk',
    'teamPartner_partnerId_partner_partnerId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'teamPartner',
    'teamPartner_assignedBy_user_id_fk',
    'teamPartner_assignedByUserId_user_id_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'contact',
    'contact_orgId_organization_id_fk',
    'contact_organizationId_organization_organizationId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'contact',
    'contact_partnerId_partner_id_fk',
    'contact_partnerId_partner_partnerId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'contact',
    'contact_createdBy_user_id_fk',
    'contact_createdByUserId_user_id_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'notification',
    'notification_orgId_organization_id_fk',
    'notification_organizationId_organization_organizationId_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'notification',
    'notification_recipientId_user_id_fk',
    'notification_recipientUserId_user_id_fk'
);
SELECT public.colabx_rename_constraint_if_exists(
    'notification',
    'notification_partnerId_partner_id_fk',
    'notification_partnerId_partner_partnerId_fk'
);

-- Index renames
SELECT public.colabx_rename_index_if_exists(
    'invitation_orgId_idx',
    'invitation_organizationId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'orgUser_orgId_idx',
    'orgUser_organizationId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'partner_orgId_idx',
    'partner_organizationId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'partner_createdBy_idx',
    'partner_createdByUserId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'team_orgId_idx',
    'team_organizationId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'team_createdBy_idx',
    'team_createdByUserId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'deal_orgId_idx',
    'deal_organizationId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'deal_createdBy_idx',
    'deal_createdByUserId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'objective_orgId_idx',
    'objective_organizationId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'objective_createdBy_idx',
    'objective_createdByUserId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'activityLog_orgId_idx',
    'activityLog_organizationId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'communication_orgId_idx',
    'communication_organizationId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'communication_senderId_idx',
    'communication_senderUserId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'document_orgId_idx',
    'document_organizationId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'document_uploadedBy_idx',
    'document_uploadedByUserId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'teamPartner_assignedBy_idx',
    'teamPartner_assignedByUserId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'contact_orgId_idx',
    'contact_organizationId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'contact_createdBy_idx',
    'contact_createdByUserId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'dealMessage_senderId_idx',
    'dealMessage_senderUserId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'dealTask_createdBy_idx',
    'dealTask_createdByUserId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'dealDocument_uploadedBy_idx',
    'dealDocument_uploadedByUserId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'notification_orgId_idx',
    'notification_organizationId_idx'
);
SELECT public.colabx_rename_index_if_exists(
    'notification_recipientId_idx',
    'notification_recipientUserId_idx'
);

DROP FUNCTION IF EXISTS public.colabx_rename_index_if_exists(text, text);
DROP FUNCTION IF EXISTS public.colabx_rename_constraint_if_exists(text, text, text);
DROP FUNCTION IF EXISTS public.colabx_rename_column_if_exists(text, text, text);
