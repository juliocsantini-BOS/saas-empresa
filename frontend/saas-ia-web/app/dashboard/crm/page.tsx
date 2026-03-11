'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

import {
  ACTIVITY_LABELS,
  API_URL,
  FILTER_STATUS_LABELS,
  INTERACTION_OPTIONS,
  STATUS_LABELS,
  STATUS_ORDER,
  TEMPERATURE_LABELS,
} from './_crm/constants';
import {
  CrmExecutiveHero,
  CrmInsightCard,
  CrmMetricCard,
  CrmStyles,
} from './_crm/components';
import {
  activityIcon,
  activityIconBadgeClass,
  formatDateShort,
  formatDateTime,
  formatRelativeTime,
  getLeadHealth,
  getLeadHealthClass,
  getLeadScore,
  getLeadTemperature,
  getTemperatureChipClass,
  getToken,
  normalizeUiText,
  sanitizeText,
  statusBadge,
  statusDotClass,
} from './_crm/utils';
import type {
  ActivityComposerType,
  BranchOption,
  DepartmentOption,
  LeadActivity,
  LeadItem,
  LeadStatus,
  LeadTask,
  PipelineResponse,
  TemperatureFilter,
  UserOption,
} from './_crm/types';

export default function Page() {

  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [pipeline, setPipeline] = useState<PipelineResponse>({
    NEW: [],
    CONTACTED: [],
    PROPOSAL: [],
    NEGOTIATION: [],
    WON: [],
    LOST: [],
  });

  const [users, setUsers] = useState<UserOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [savingLeadDetails, setSavingLeadDetails] = useState(false);
  const [deletingLead, setDeletingLead] = useState(false);
  const [editingLead, setEditingLead] = useState(false);
  const [error, setError] = useState('');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<LeadStatus | null>(null);
  const [openCardStatusMenuId, setOpenCardStatusMenuId] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [formError, setFormError] = useState('');
  const [leadModalError, setLeadModalError] = useState('');

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<LeadStatus>('NEW');
  const [formOwnerUserId, setFormOwnerUserId] = useState<string>('NONE');
  const [formBranchId, setFormBranchId] = useState<string>('NONE');
  const [formDepartmentId, setFormDepartmentId] = useState<string>('NONE');

  const [editLeadName, setEditLeadName] = useState('');
  const [editLeadPhone, setEditLeadPhone] = useState('');
  const [editLeadEmail, setEditLeadEmail] = useState('');
  const [editLeadCompanyName, setEditLeadCompanyName] = useState('');
  const [editLeadNotes, setEditLeadNotes] = useState('');
  const [editOwnerUserId, setEditOwnerUserId] = useState<string>('NONE');
  const [editBranchId, setEditBranchId] = useState<string>('NONE');
  const [editDepartmentId, setEditDepartmentId] = useState<string>('NONE');

  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [tasks, setTasks] = useState<LeadTask[]>([]);
  const [loadingLeadExtras, setLoadingLeadExtras] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [creatingActivity, setCreatingActivity] = useState(false);
  const [activityType, setActivityType] = useState<ActivityComposerType>('NOTE');
  const [activityDescription, setActivityDescription] = useState('');
  const [showActivityComposer, setShowActivityComposer] = useState(false);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueAt, setTaskDueAt] = useState('');
  const [taskAssignedUserId, setTaskAssignedUserId] = useState<string>('NONE');
  const [isTaskAssignedUserMenuOpen, setIsTaskAssignedUserMenuOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LeadStatus>('ALL');
  const [temperatureFilter, setTemperatureFilter] = useState<TemperatureFilter>('ALL');
  const [ownerFilter, setOwnerFilter] = useState<string>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  const [isCreateStatusMenuOpen, setIsCreateStatusMenuOpen] = useState(false);
  const [isFilterStatusMenuOpen, setIsFilterStatusMenuOpen] = useState(false);
  const [isFilterTemperatureMenuOpen, setIsFilterTemperatureMenuOpen] = useState(false);
  const [isFilterOwnerMenuOpen, setIsFilterOwnerMenuOpen] = useState(false);
  const [isFilterBranchMenuOpen, setIsFilterBranchMenuOpen] = useState(false);
  const [isFilterDepartmentMenuOpen, setIsFilterDepartmentMenuOpen] = useState(false);
  const [isCreateOwnerMenuOpen, setIsCreateOwnerMenuOpen] = useState(false);
  const [isCreateBranchMenuOpen, setIsCreateBranchMenuOpen] = useState(false);
  const [isCreateDepartmentMenuOpen, setIsCreateDepartmentMenuOpen] = useState(false);
  const [isEditOwnerMenuOpen, setIsEditOwnerMenuOpen] = useState(false);
  const [isEditBranchMenuOpen, setIsEditBranchMenuOpen] = useState(false);
  const [isEditDepartmentMenuOpen, setIsEditDepartmentMenuOpen] = useState(false);

  const statusMenuRef = useRef<HTMLDivElement | null>(null);
  const createStatusMenuRef = useRef<HTMLDivElement | null>(null);
  const filterStatusMenuRef = useRef<HTMLDivElement | null>(null);
  const filterTemperatureMenuRef = useRef<HTMLDivElement | null>(null);
  const filterOwnerMenuRef = useRef<HTMLDivElement | null>(null);
  const filterBranchMenuRef = useRef<HTMLDivElement | null>(null);
  const filterDepartmentMenuRef = useRef<HTMLDivElement | null>(null);
  const createOwnerMenuRef = useRef<HTMLDivElement | null>(null);
  const createBranchMenuRef = useRef<HTMLDivElement | null>(null);
  const createDepartmentMenuRef = useRef<HTMLDivElement | null>(null);
  const editOwnerMenuRef = useRef<HTMLDivElement | null>(null);
  const editBranchMenuRef = useRef<HTMLDivElement | null>(null);
  const editDepartmentMenuRef = useRef<HTMLDivElement | null>(null);
  const taskAssignedUserMenuRef = useRef<HTMLDivElement | null>(null);
  const pipelineSectionRef = useRef<HTMLDivElement | null>(null);

  const createDepartments = useMemo(() => {
    if (formBranchId === 'NONE') return departments;
    return departments.filter((department) => department.branchId === formBranchId);
  }, [departments, formBranchId]);

  const editDepartments = useMemo(() => {
    if (editBranchId === 'NONE') return departments;
    return departments.filter((department) => department.branchId === editBranchId);
  }, [departments, editBranchId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (statusMenuRef.current && !statusMenuRef.current.contains(target)) setIsStatusMenuOpen(false);
      if (createStatusMenuRef.current && !createStatusMenuRef.current.contains(target)) setIsCreateStatusMenuOpen(false);
      if (filterStatusMenuRef.current && !filterStatusMenuRef.current.contains(target)) setIsFilterStatusMenuOpen(false);
      if (filterTemperatureMenuRef.current && !filterTemperatureMenuRef.current.contains(target)) setIsFilterTemperatureMenuOpen(false);
      if (filterOwnerMenuRef.current && !filterOwnerMenuRef.current.contains(target)) setIsFilterOwnerMenuOpen(false);
      if (filterBranchMenuRef.current && !filterBranchMenuRef.current.contains(target)) setIsFilterBranchMenuOpen(false);
      if (filterDepartmentMenuRef.current && !filterDepartmentMenuRef.current.contains(target)) setIsFilterDepartmentMenuOpen(false);
      if (createOwnerMenuRef.current && !createOwnerMenuRef.current.contains(target)) setIsCreateOwnerMenuOpen(false);
      if (createBranchMenuRef.current && !createBranchMenuRef.current.contains(target)) setIsCreateBranchMenuOpen(false);
      if (createDepartmentMenuRef.current && !createDepartmentMenuRef.current.contains(target)) setIsCreateDepartmentMenuOpen(false);
      if (editOwnerMenuRef.current && !editOwnerMenuRef.current.contains(target)) setIsEditOwnerMenuOpen(false);
      if (editBranchMenuRef.current && !editBranchMenuRef.current.contains(target)) setIsEditBranchMenuOpen(false);
      if (editDepartmentMenuRef.current && !editDepartmentMenuRef.current.contains(target)) setIsEditDepartmentMenuOpen(false);
      if (taskAssignedUserMenuRef.current && !taskAssignedUserMenuRef.current.contains(target)) {
        setIsTaskAssignedUserMenuOpen(false);
      }

      if (!target.closest('[data-card-status-menu="true"]')) {
        setOpenCardStatusMenuId(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsStatusMenuOpen(false);
        setIsCreateStatusMenuOpen(false);
        setIsFilterStatusMenuOpen(false);
        setIsFilterTemperatureMenuOpen(false);
        setIsFilterOwnerMenuOpen(false);
        setIsFilterBranchMenuOpen(false);
        setIsFilterDepartmentMenuOpen(false);
        setIsCreateOwnerMenuOpen(false);
        setIsCreateBranchMenuOpen(false);
        setIsCreateDepartmentMenuOpen(false);
        setIsEditOwnerMenuOpen(false);
        setIsEditBranchMenuOpen(false);
        setIsEditDepartmentMenuOpen(false);
        setIsTaskAssignedUserMenuOpen(false);
        setOpenCardStatusMenuId(null);
        setDragOverStatus(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function loadCrm() {
    const token = getToken();

    if (!token) {
      setError('Token não encontrado.');
      setLoading(false);
      return;
    }

    try {
      const [leadsRes, pipelineRes, usersRes, branchesRes, departmentsRes] = await Promise.all([
        axios.get(API_URL + '/v1/crm/leads', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        axios.get(API_URL + '/v1/crm/leads/pipeline', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        axios.get(API_URL + '/v1/users', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        axios.get(API_URL + '/v1/branches', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        axios.get(API_URL + '/v1/departments', {
          headers: { Authorization: 'Bearer ' + token },
        }),
      ]);

      const leadsData = Array.isArray(leadsRes.data) ? leadsRes.data : [];
      const pipelineData = pipelineRes.data || {};

      setLeads(leadsData);
      setPipeline({
        NEW: Array.isArray(pipelineData.NEW) ? pipelineData.NEW : [],
        CONTACTED: Array.isArray(pipelineData.CONTACTED) ? pipelineData.CONTACTED : [],
        PROPOSAL: Array.isArray(pipelineData.PROPOSAL) ? pipelineData.PROPOSAL : [],
        NEGOTIATION: Array.isArray(pipelineData.NEGOTIATION) ? pipelineData.NEGOTIATION : [],
        WON: Array.isArray(pipelineData.WON) ? pipelineData.WON : [],
        LOST: Array.isArray(pipelineData.LOST) ? pipelineData.LOST : [],
      });
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);
      setDepartments(Array.isArray(departmentsRes.data) ? departmentsRes.data : []);
      setError('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao carregar CRM.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  }

  async function loadLeadExtras(leadId: string) {
    const token = getToken();

    if (!token) {
      setLeadModalError('Token não encontrado.');
      return;
    }

    setLoadingLeadExtras(true);

    try {
      const [activitiesRes, tasksRes] = await Promise.all([
        axios.get(API_URL + '/v1/crm/leads/' + leadId + '/activities', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        axios.get(API_URL + '/v1/crm/leads/' + leadId + '/tasks', {
          headers: { Authorization: 'Bearer ' + token },
        }),
      ]);

      setActivities(Array.isArray(activitiesRes.data) ? activitiesRes.data : []);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao carregar timeline e tarefas.';
      setLeadModalError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoadingLeadExtras(false);
    }
  }

  useEffect(() => {
    loadCrm();
  }, []);

  const filteredLeads = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesTerm =
        !term ||
        lead.name?.toLowerCase().includes(term) ||
        lead.companyName?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.phone?.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

      const previewScore = getLeadScore(lead, [], []);
      const previewTemperature = getLeadTemperature(previewScore);

      const matchesTemperature =
        temperatureFilter === 'ALL' ||
        (temperatureFilter === 'HOT' &&
          (previewTemperature === 'Muito quente' || previewTemperature === 'Quente')) ||
        (temperatureFilter === 'WARM' && previewTemperature === 'Morno') ||
        (temperatureFilter === 'COLD' && previewTemperature === 'Frio');

      const matchesOwner = ownerFilter === 'ALL' || (lead.ownerUserId ?? 'NONE') === ownerFilter;
      const matchesBranch = branchFilter === 'ALL' || (lead.branchId ?? 'NONE') === branchFilter;
      const matchesDepartment =
        departmentFilter === 'ALL' || (lead.departmentId ?? 'NONE') === departmentFilter;

      return (
        matchesTerm &&
        matchesStatus &&
        matchesTemperature &&
        matchesOwner &&
        matchesBranch &&
        matchesDepartment
      );
    });
  }, [leads, searchTerm, statusFilter, temperatureFilter, ownerFilter, branchFilter, departmentFilter]);

  const filteredPipeline = useMemo(() => {
    return {
      NEW: filteredLeads.filter((lead) => lead.status === 'NEW'),
      CONTACTED: filteredLeads.filter((lead) => lead.status === 'CONTACTED'),
      PROPOSAL: filteredLeads.filter((lead) => lead.status === 'PROPOSAL'),
      NEGOTIATION: filteredLeads.filter((lead) => lead.status === 'NEGOTIATION'),
      WON: filteredLeads.filter((lead) => lead.status === 'WON'),
      LOST: filteredLeads.filter((lead) => lead.status === 'LOST'),
    } as PipelineResponse;
  }, [filteredLeads]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const openStatuses: LeadStatus[] = ['NEW', 'CONTACTED', 'PROPOSAL', 'NEGOTIATION'];

    const openLeads = filteredLeads.filter((lead) => openStatuses.includes(lead.status));
    const wonLeads = filteredLeads.filter((lead) => lead.status === 'WON');
    const lostLeads = filteredLeads.filter((lead) => lead.status === 'LOST');

    const newThisMonth = filteredLeads.filter((lead) => {
      const createdAt = new Date(lead.createdAt);
      return (
        createdAt.getMonth() === currentMonth &&
        createdAt.getFullYear() === currentYear
      );
    }).length;

    const conversionRate =
      filteredLeads.length > 0
        ? Math.round((wonLeads.length / filteredLeads.length) * 100)
        : 0;

    const hotLeads = filteredLeads.filter((lead) => {
      const previewScore = getLeadScore(lead, [], []);
      return previewScore >= 60;
    }).length;

    const stalledLeads = filteredLeads.filter((lead) => {
      const health = getLeadHealth(lead.updatedAt, lead.status);
      return health === 'Crítico' || health === 'Atenção';
    }).length;

    return {
      total: filteredLeads.length,
      pipeline: STATUS_ORDER.length,
      open: openLeads.length,
      won: wonLeads.length,
      lost: lostLeads.length,
      contacted: filteredLeads.filter((lead) => lead.status === 'CONTACTED').length,
      proposal: filteredLeads.filter((lead) => lead.status === 'PROPOSAL').length,
      conversionRate,
      newThisMonth,
      hotLeads,
      stalledLeads,
    };
  }, [filteredLeads]);

  const selectedLeadScore = useMemo(() => {
    return getLeadScore(selectedLead, activities, tasks);
  }, [selectedLead, activities, tasks]);

  const selectedLeadTemperature = useMemo(() => {
    return getLeadTemperature(selectedLeadScore);
  }, [selectedLeadScore]);

  const selectedLeadHealth = useMemo(() => {
    return getLeadHealth(selectedLead?.updatedAt, selectedLead?.status);
  }, [selectedLead]);

  const selectedLeadOpenTasks = useMemo(() => {
    return tasks.filter((task) => !task.completedAt);
  }, [tasks]);

  const selectedLeadOverdueTasks = useMemo(() => {
    const now = Date.now();
    return tasks.filter((task) => task.dueAt && !task.completedAt && new Date(task.dueAt).getTime() < now);
  }, [tasks]);

  const topOwner = useMemo(() => {
    const counter = new Map<string, number>();

    filteredLeads.forEach((lead) => {
      const key = lead.ownerUser?.name || getUserLabel(lead.ownerUserId);
      counter.set(key, (counter.get(key) || 0) + 1);
    });

    const sorted = Array.from(counter.entries()).sort((a, b) => b[1] - a[1]);
    return sorted[0] || null;
  }, [filteredLeads, users]);

  function getUserLabel(id?: string | null) {
    if (!id) return 'Não definido';
    const user = users.find((item) => item.id === id);
    return user?.name || id;
  }

  function getBranchLabel(id?: string | null) {
    if (!id) return 'Não definida';
    const branch = branches.find((item) => item.id === id);
    return branch?.name || id;
  }

  function getDepartmentLabel(id?: string | null) {
    if (!id) return 'Não definido';
    const department = departments.find((item) => item.id === id);
    return department?.name || id;
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    setFormError('');
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormCompanyName('');
    setFormNotes('');
    setFormStatus('NEW');
    setFormOwnerUserId('NONE');
    setFormBranchId('NONE');
    setFormDepartmentId('NONE');
    setIsCreateStatusMenuOpen(false);
    setIsCreateOwnerMenuOpen(false);
    setIsCreateBranchMenuOpen(false);
    setIsCreateDepartmentMenuOpen(false);
  }

  function resetLeadEditForm(lead: LeadItem) {
    setEditLeadName(lead.name || '');
    setEditLeadPhone(lead.phone || '');
    setEditLeadEmail(lead.email || '');
    setEditLeadCompanyName(lead.companyName || '');
    setEditLeadNotes(lead.notes || '');
    setEditOwnerUserId(lead.ownerUserId || 'NONE');
    setEditBranchId(lead.branchId || 'NONE');
    setEditDepartmentId(lead.departmentId || 'NONE');
    setLeadModalError('');
  }

  function resetTaskForm() {
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueAt('');
    setTaskAssignedUserId('NONE');
    setIsTaskAssignedUserMenuOpen(false);
  }

  function resetActivityForm() {
    setActivityType('NOTE');
    setActivityDescription('');
    setShowActivityComposer(false);
  }

  function closeDeleteConfirmModal() {
    setShowDeleteConfirmModal(false);
  }

  function closeLeadModal() {
    setSelectedLead(null);
    setEditingLead(false);
    setLeadModalError('');
    setIsStatusMenuOpen(false);
    setShowDeleteConfirmModal(false);
    setActivities([]);
    setTasks([]);
    resetTaskForm();
    resetActivityForm();
    setIsEditOwnerMenuOpen(false);
    setIsEditBranchMenuOpen(false);
    setIsEditDepartmentMenuOpen(false);
  }

  async function openLeadModal(lead: LeadItem) {
    setSelectedLead(lead);
    setEditingLead(false);
    setIsStatusMenuOpen(false);
    setShowDeleteConfirmModal(false);
    resetLeadEditForm(lead);
    resetTaskForm();
    resetActivityForm();
    await loadLeadExtras(lead.id);
  }

  function enableLeadEdit() {
    if (!selectedLead) return;
    resetLeadEditForm(selectedLead);
    setEditingLead(true);
  }

  function cancelLeadEdit() {
    if (!selectedLead) return;
    resetLeadEditForm(selectedLead);
    setEditingLead(false);
  }

  async function handleCreateLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      setFormError('Token não encontrado.');
      return;
    }

    setCreating(true);
    setFormError('');

    try {
      await axios.post(
        API_URL + '/v1/crm/leads',
        {
          name: formName,
          phone: formPhone || undefined,
          email: formEmail || undefined,
          companyName: formCompanyName || undefined,
          notes: formNotes || undefined,
          status: formStatus,
          ownerUserId: formOwnerUserId !== 'NONE' ? formOwnerUserId : undefined,
          branchId: formBranchId !== 'NONE' ? formBranchId : undefined,
          departmentId: formDepartmentId !== 'NONE' ? formDepartmentId : undefined,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      );

      closeCreateModal();
      setLoading(true);
      await loadCrm();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao criar lead.';
      setFormError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setCreating(false);
    }
  }

  async function handleMoveLead(leadId: string, newStatus: LeadStatus) {
    const token = getToken();

    if (!token) {
      setError('Token não encontrado.');
      return;
    }

    setUpdatingLeadId(leadId);
    setError('');
    setLeadModalError('');

    try {
      await axios.patch(
        API_URL + '/v1/crm/leads/' + leadId,
        { status: newStatus },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      );

      await loadCrm();

      setSelectedLead((current) =>
        current && current.id === leadId
          ? { ...current, status: newStatus, updatedAt: new Date().toISOString() }
          : current,
      );

      if (selectedLead?.id === leadId) {
        await loadLeadExtras(leadId);
      }

      setIsStatusMenuOpen(false);
      setOpenCardStatusMenuId(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao atualizar status do lead.';
      const parsed = Array.isArray(msg) ? msg.join(', ') : String(msg);
      setError(parsed);
      setLeadModalError(parsed);
    } finally {
      setUpdatingLeadId(null);
    }
  }

  async function handleDropLead(targetStatus: LeadStatus) {
    if (!draggingLeadId) return;

    const draggedLead = leads.find((lead) => lead.id === draggingLeadId);
    if (!draggedLead) {
      setDraggingLeadId(null);
      setDragOverStatus(null);
      return;
    }

    if (draggedLead.status === targetStatus) {
      setDraggingLeadId(null);
      setDragOverStatus(null);
      return;
    }

    await handleMoveLead(draggingLeadId, targetStatus);
    setDraggingLeadId(null);
    setDragOverStatus(null);
  }

  async function handleSaveLeadDetails() {
    if (!selectedLead) return;

    const token = getToken();

    if (!token) {
      setLeadModalError('Token não encontrado.');
      return;
    }

    setSavingLeadDetails(true);
    setLeadModalError('');

    try {
      await axios.patch(
        API_URL + '/v1/crm/leads/' + selectedLead.id,
        {
          name: editLeadName,
          phone: editLeadPhone || null,
          email: editLeadEmail || null,
          companyName: editLeadCompanyName || null,
          notes: editLeadNotes || null,
          ownerUserId: editOwnerUserId !== 'NONE' ? editOwnerUserId : null,
          branchId: editBranchId !== 'NONE' ? editBranchId : null,
          departmentId: editDepartmentId !== 'NONE' ? editDepartmentId : null,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      );

      const updatedLead: LeadItem = {
        ...selectedLead,
        name: editLeadName,
        phone: editLeadPhone || null,
        email: editLeadEmail || null,
        companyName: editLeadCompanyName || null,
        notes: editLeadNotes || null,
        ownerUserId: editOwnerUserId !== 'NONE' ? editOwnerUserId : null,
        branchId: editBranchId !== 'NONE' ? editBranchId : null,
        departmentId: editDepartmentId !== 'NONE' ? editDepartmentId : null,
        updatedAt: new Date().toISOString(),
      };

      setSelectedLead(updatedLead);
      setEditingLead(false);
      await loadCrm();
      await loadLeadExtras(selectedLead.id);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao salvar alterações do lead.';
      setLeadModalError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setSavingLeadDetails(false);
    }
  }

  async function handleDeleteLead() {
    if (!selectedLead) return;

    const token = getToken();

    if (!token) {
      setLeadModalError('Token não encontrado.');
      setShowDeleteConfirmModal(false);
      return;
    }

    setDeletingLead(true);
    setLeadModalError('');

    try {
      await axios.delete(API_URL + '/v1/crm/leads/' + selectedLead.id, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      setShowDeleteConfirmModal(false);
      setSelectedLead(null);
      setEditingLead(false);
      setIsStatusMenuOpen(false);
      await loadCrm();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao excluir lead.';
      setLeadModalError(Array.isArray(msg) ? msg.join(', ') : String(msg));
      setShowDeleteConfirmModal(false);
    } finally {
      setDeletingLead(false);
    }
  }

  async function handleCreateTask() {
    if (!selectedLead) return;

    const token = getToken();

    if (!token) {
      setLeadModalError('Token não encontrado.');
      return;
    }

    if (!taskTitle.trim()) {
      setLeadModalError('Informe o título da tarefa.');
      return;
    }

    setCreatingTask(true);
    setLeadModalError('');

    try {
      await axios.post(
        API_URL + '/v1/crm/leads/' + selectedLead.id + '/tasks',
        {
          title: taskTitle,
          description: taskDescription || undefined,
          dueAt: taskDueAt ? new Date(taskDueAt).toISOString() : undefined,
          assignedUserId: taskAssignedUserId !== 'NONE' ? taskAssignedUserId : undefined,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      );

      resetTaskForm();
      await loadLeadExtras(selectedLead.id);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao criar tarefa.';
      setLeadModalError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setCreatingTask(false);
    }
  }

  async function handleCreateActivity() {
    if (!selectedLead) return;

    const token = getToken();

    if (!token) {
      setLeadModalError('Token não encontrado.');
      return;
    }

    if (!activityDescription.trim()) {
      setLeadModalError('Informe a descrição da interação.');
      return;
    }

    setCreatingActivity(true);
    setLeadModalError('');

    try {
      await axios.post(
        API_URL + '/v1/crm/leads/' + selectedLead.id + '/activities',
        {
          type: activityType,
          description: activityDescription,
        },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      );

      resetActivityForm();
      await loadLeadExtras(selectedLead.id);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao registrar interação.';
      setLeadModalError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setCreatingActivity(false);
    }
  }

  async function handleCompleteTask(taskId: string) {
    if (!selectedLead) return;

    const token = getToken();

    if (!token) {
      setLeadModalError('Token não encontrado.');
      return;
    }

    setCompletingTaskId(taskId);
    setLeadModalError('');

    try {
      await axios.patch(
        API_URL + '/v1/crm/leads/tasks/' + taskId + '/complete',
        {},
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      );

      await loadLeadExtras(selectedLead.id);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao concluir tarefa.';
      setLeadModalError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setCompletingTaskId(null);
    }
  }

  function scrollToPipeline() {
    pipelineSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  return (
    <div className="space-y-5">
      <CrmStyles />

      <CrmExecutiveHero
        stats={stats}
        topOwner={topOwner}
        dominantStatus={STATUS_ORDER.reduce(
          (best, current) =>
            filteredPipeline[current].length > filteredPipeline[best].length ? current : best,
          'NEW',
        )}
        onAddLead={() => setShowCreateModal(true)}
        onViewPipeline={scrollToPipeline}
      />

      <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-white">Filtros inteligentes</div>
            <div className="mt-1 text-xs text-zinc-500">
              Busque e refine sua operação comercial
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
              setTemperatureFilter('ALL');
              setOwnerFilter('ALL');
              setBranchFilter('ALL');
              setDepartmentFilter('ALL');
              setIsFilterStatusMenuOpen(false);
              setIsFilterTemperatureMenuOpen(false);
              setIsFilterOwnerMenuOpen(false);
              setIsFilterBranchMenuOpen(false);
              setIsFilterDepartmentMenuOpen(false);
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300 transition hover:bg-white/10"
          >
            Limpar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">
              Buscar
            </label>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#3BFF8C]/40"
              placeholder="Nome, empresa, e-mail ou telefone"
            />
          </div>

          <div ref={filterStatusMenuRef} className="relative">
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">
              Status
            </label>

            <button
              type="button"
              onClick={() => {
                setIsFilterStatusMenuOpen((prev) => !prev);
                setIsFilterTemperatureMenuOpen(false);
                setIsFilterOwnerMenuOpen(false);
                setIsFilterBranchMenuOpen(false);
                setIsFilterDepartmentMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-3 text-left text-sm text-white transition hover:border-[#3BFF8C]/25 hover:bg-white/[0.03]"
            >
              <span>{FILTER_STATUS_LABELS[statusFilter]}</span>
              <span className={isFilterStatusMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                &#9662;
              </span>
            </button>

            {isFilterStatusMenuOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="space-y-1">
                  {(['ALL', ...STATUS_ORDER] as Array<'ALL' | LeadStatus>).map((item) => {
                    const active = statusFilter === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setStatusFilter(item);
                          setIsFilterStatusMenuOpen(false);
                        }}
                        className={
                          active
                            ? 'flex w-full items-center justify-between rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-sm text-white'
                            : 'flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white'
                        }
                      >
                        <span>{FILTER_STATUS_LABELS[item]}</span>
                        {active ? <span className="h-2.5 w-2.5 rounded-full bg-[#3BFF8C]" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div ref={filterTemperatureMenuRef} className="relative">
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">
              Temperatura
            </label>

            <button
              type="button"
              onClick={() => {
                setIsFilterTemperatureMenuOpen((prev) => !prev);
                setIsFilterStatusMenuOpen(false);
                setIsFilterOwnerMenuOpen(false);
                setIsFilterBranchMenuOpen(false);
                setIsFilterDepartmentMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-3 text-left text-sm text-white transition hover:border-[#3BFF8C]/25 hover:bg-white/[0.03]"
            >
              <span>{TEMPERATURE_LABELS[temperatureFilter]}</span>
              <span className={isFilterTemperatureMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                &#9662;
              </span>
            </button>

            {isFilterTemperatureMenuOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="space-y-1">
                  {(['ALL', 'HOT', 'WARM', 'COLD'] as TemperatureFilter[]).map((item) => {
                    const active = temperatureFilter === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setTemperatureFilter(item);
                          setIsFilterTemperatureMenuOpen(false);
                        }}
                        className={
                          active
                            ? 'flex w-full items-center justify-between rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-sm text-white'
                            : 'flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white'
                        }
                      >
                        <span>{TEMPERATURE_LABELS[item]}</span>
                        {active ? <span className="h-2.5 w-2.5 rounded-full bg-[#3BFF8C]" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div ref={filterOwnerMenuRef} className="relative">
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">
              Responsável
            </label>

            <button
              type="button"
              onClick={() => {
                setIsFilterOwnerMenuOpen((prev) => !prev);
                setIsFilterStatusMenuOpen(false);
                setIsFilterTemperatureMenuOpen(false);
                setIsFilterBranchMenuOpen(false);
                setIsFilterDepartmentMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-3 text-left text-sm text-white transition hover:border-[#3BFF8C]/25 hover:bg-white/[0.03]"
            >
              <span>{ownerFilter === 'ALL' ? 'Todos' : getUserLabel(ownerFilter)}</span>
              <span className={isFilterOwnerMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                &#9662;
              </span>
            </button>

            {isFilterOwnerMenuOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOwnerFilter('ALL');
                      setIsFilterOwnerMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <span>Todos</span>
                  </button>

                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setOwnerFilter(user.id);
                        setIsFilterOwnerMenuOpen(false);
                      }}
                      className={
                        ownerFilter === user.id
                          ? 'flex w-full items-center justify-between rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-sm text-white'
                          : 'flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white'
                      }
                    >
                      <span>{user.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div ref={filterBranchMenuRef} className="relative">
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">
              Filial
            </label>

            <button
              type="button"
              onClick={() => {
                setIsFilterBranchMenuOpen((prev) => !prev);
                setIsFilterStatusMenuOpen(false);
                setIsFilterTemperatureMenuOpen(false);
                setIsFilterOwnerMenuOpen(false);
                setIsFilterDepartmentMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-3 text-left text-sm text-white transition hover:border-[#3BFF8C]/25 hover:bg-white/[0.03]"
            >
              <span>{branchFilter === 'ALL' ? 'Todas' : getBranchLabel(branchFilter)}</span>
              <span className={isFilterBranchMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                &#9662;
              </span>
            </button>

            {isFilterBranchMenuOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setBranchFilter('ALL');
                      setDepartmentFilter('ALL');
                      setIsFilterBranchMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <span>Todas</span>
                  </button>

                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => {
                        setBranchFilter(branch.id);
                        setDepartmentFilter('ALL');
                        setIsFilterBranchMenuOpen(false);
                      }}
                      className={
                        branchFilter === branch.id
                          ? 'flex w-full items-center justify-between rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-sm text-white'
                          : 'flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white'
                      }
                    >
                      <span>{branch.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div ref={filterDepartmentMenuRef} className="relative xl:col-span-2">
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">
              Departamento
            </label>

            <button
              type="button"
              onClick={() => {
                setIsFilterDepartmentMenuOpen((prev) => !prev);
                setIsFilterStatusMenuOpen(false);
                setIsFilterTemperatureMenuOpen(false);
                setIsFilterOwnerMenuOpen(false);
                setIsFilterBranchMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-3 text-left text-sm text-white transition hover:border-[#3BFF8C]/25 hover:bg-white/[0.03]"
            >
              <span>{departmentFilter === 'ALL' ? 'Todos' : getDepartmentLabel(departmentFilter)}</span>
              <span className={isFilterDepartmentMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                &#9662;
              </span>
            </button>

            {isFilterDepartmentMenuOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDepartmentFilter('ALL');
                      setIsFilterDepartmentMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <span>Todos</span>
                  </button>

                  {departments
                    .filter((department) => branchFilter === 'ALL' || department.branchId === branchFilter)
                    .map((department) => (
                      <button
                        key={department.id}
                        type="button"
                        onClick={() => {
                          setDepartmentFilter(department.id);
                          setIsFilterDepartmentMenuOpen(false);
                        }}
                        className={
                          departmentFilter === department.id
                            ? 'flex w-full items-center justify-between rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-sm text-white'
                            : 'flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white'
                        }
                      >
                        <span>{department.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <CrmMetricCard
          label="Leads totais"
          value={stats.total}
          helper="Base total filtrada"
        />
        <CrmMetricCard
          label="Leads abertos"
          value={stats.open}
          helper="Oportunidades em andamento"
        />
        <CrmMetricCard
          label="Ganhos"
          value={stats.won}
          helper="Negócios fechados com sucesso"
          accent="success"
        />
        <CrmMetricCard
          label="Perdidos"
          value={stats.lost}
          helper="Oportunidades encerradas"
          accent="danger"
        />
        <CrmMetricCard
          label="Conversão"
          value={`${stats.conversionRate}%`}
          helper="Relação entre ganhos e total"
        />
        <CrmMetricCard
          label="Novos no mês"
          value={stats.newThisMonth}
          helper="Criados no mês atual"
        />
        <CrmMetricCard
          label="Leads quentes"
          value={stats.hotLeads}
          helper="Maior chance de fechamento"
          accent="success"
        />
        <CrmMetricCard
          label="Em atenção"
          value={stats.stalledLeads}
          helper="Leads sem ritmo ideal"
          accent="attention"
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div
            ref={pipelineSectionRef}
            className="rounded-[32px] border border-white/10 bg-[#111113] p-6"
          >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-white">Pipeline comercial</div>
                <div className="mt-1 text-sm text-zinc-500">
                  Visualização em kanban por etapa do funil
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                  {stats.total} leads filtrados
                </span>
                <span className="rounded-full border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-3 py-1 text-xs text-[#9CFFC2]">
                  {stats.hotLeads} quentes
                </span>
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-400">
                Carregando pipeline...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {STATUS_ORDER.map((status) => (
                  <div
                    key={status}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverStatus(status);
                    }}
                    onDragLeave={() => {
                      if (dragOverStatus === status) setDragOverStatus(null);
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      await handleDropLead(status);
                    }}
                    className={
                      dragOverStatus === status
                        ? 'rounded-3xl border border-[#3BFF8C]/30 bg-[radial-gradient(circle_at_top,rgba(59,255,140,0.10),transparent_70%),rgba(255,255,255,0.02)] p-4 shadow-[0_0_24px_rgba(59,255,140,0.08)] transition'
                        : 'rounded-3xl border border-white/10 bg-black/20 p-4 transition'
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-white">{STATUS_LABELS[status]}</div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-zinc-300">
                        {filteredPipeline[status].length}
                      </span>
                    </div>

                    <div className="mt-4 min-h-[120px] space-y-3">
                      {filteredPipeline[status].length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-500">
                          Solte um lead aqui
                        </div>
                      ) : (
                        filteredPipeline[status].map((lead) => {
                          const cardMenuOpen = openCardStatusMenuId === lead.id;
                          const isUpdatingThisLead = updatingLeadId === lead.id;
                          const previewScore = getLeadScore(lead, [], []);
                          const previewTemp = getLeadTemperature(previewScore);
                          const previewHealth = getLeadHealth(lead.updatedAt, lead.status);

                          return (
                            <div
                              key={lead.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', lead.id);
                                e.dataTransfer.effectAllowed = 'move';
                                setDraggingLeadId(lead.id);
                              }}
                              onDragEnd={() => {
                                setDraggingLeadId(null);
                                setDragOverStatus(null);
                              }}
                              onClick={() => openLeadModal(lead)}
                              className={
                                draggingLeadId === lead.id
                                  ? 'w-full cursor-grabbing rounded-2xl border border-[#3BFF8C]/20 bg-[#111113] p-3 text-left opacity-60 transition'
                                  : 'w-full cursor-grab rounded-2xl border border-white/10 bg-[#111113] p-3 text-left transition hover:border-[#3BFF8C]/30 hover:bg-white/[0.02] active:cursor-grabbing'
                              }
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-medium text-white">{lead.name}</div>
                                  <div className="mt-1 text-xs text-zinc-500">
                                    {lead.companyName || 'Sem empresa'}
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-right">
                                  <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                                    Score
                                  </div>
                                  <div className="mt-1 text-sm font-semibold text-[#3BFF8C]">
                                    {previewScore}
                                  </div>
                                  <div className="text-[10px] text-zinc-500">{previewTemp}</div>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className={`rounded-full border px-2.5 py-1 text-[10px] ${getTemperatureChipClass(previewScore)}`}>
                                  {previewTemp}
                                </span>
                                <span className={`rounded-full border px-2.5 py-1 text-[10px] ${getLeadHealthClass(lead.updatedAt, lead.status)}`}>
                                  {previewHealth}
                                </span>
                              </div>

                              <div className="mt-2 text-xs text-zinc-500">
                                {lead.ownerUser?.name || getUserLabel(lead.ownerUserId)}
                                {' • '}
                                {lead.branch?.name || getBranchLabel(lead.branchId)}
                              </div>

                              {lead.email || lead.phone ? (
                                <div className="mt-2 text-xs text-zinc-500">
                                  {lead.email || ''}
                                  {lead.email && lead.phone ? ' • ' : ''}
                                  {lead.phone || ''}
                                </div>
                              ) : null}

                              <div className="mt-2 text-[11px] text-zinc-600">
                                Atualizado {formatRelativeTime(lead.updatedAt)}
                              </div>

                              <div className="mt-3 flex flex-col gap-3">
                                <span className={statusBadge(lead.status)}>
                                  {STATUS_LABELS[lead.status]}
                                </span>

                                <div
                                  data-card-status-menu="true"
                                  className="relative"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    disabled={isUpdatingThisLead}
                                    onClick={() =>
                                      setOpenCardStatusMenuId((current) =>
                                        current === lead.id ? null : lead.id,
                                      )
                                    }
                                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-3 py-2 text-left text-xs text-white transition hover:border-[#3BFF8C]/25 hover:bg-white/[0.03] disabled:opacity-60"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`h-2.5 w-2.5 rounded-full ${statusDotClass(lead.status)}`} />
                                      <span>
                                        {isUpdatingThisLead ? 'Atualizando...' : STATUS_LABELS[lead.status]}
                                      </span>
                                    </div>

                                    <span className={cardMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                                      &#9662;
                                    </span>
                                  </button>

                                  {cardMenuOpen ? (
                                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                                      <div className="space-y-1">
                                        {STATUS_ORDER.map((nextStatus) => {
                                          const active = lead.status === nextStatus;

                                          return (
                                            <button
                                              key={nextStatus}
                                              type="button"
                                              disabled={active || isUpdatingThisLead}
                                              onClick={() => handleMoveLead(lead.id, nextStatus)}
                                              className={
                                                active
                                                  ? 'flex w-full items-center justify-between rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-xs text-white'
                                                  : 'flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-xs text-zinc-300 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50'
                                              }
                                            >
                                              <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full ${statusDotClass(nextStatus)}`} />
                                                <span>{STATUS_LABELS[nextStatus]}</span>
                                              </div>

                                              {active ? <span className="h-2.5 w-2.5 rounded-full bg-[#3BFF8C]" /> : null}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 rounded-[32px] border border-white/10 bg-[#111113] p-6">
            <div className="mb-6">
              <div className="text-lg font-semibold text-white">Visão comercial</div>
              <div className="mt-1 text-sm text-zinc-500">
                Leitura rápida do funil com base nos filtros atuais
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Contatados</div>
                <div className="mt-3 text-2xl font-semibold text-white">{stats.contacted}</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Em proposta</div>
                <div className="mt-3 text-2xl font-semibold text-white">{stats.proposal}</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Ganhos</div>
                <div className="mt-3 text-2xl font-semibold text-[#3BFF8C]">{stats.won}</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Perdidos</div>
                <div className="mt-3 text-2xl font-semibold text-red-300">{stats.lost}</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Conversão</div>
                <div className="mt-3 text-2xl font-semibold text-white">{stats.conversionRate}%</div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[32px] border border-white/10 bg-[#111113] p-6">
            <div className="mb-6">
              <div className="text-lg font-semibold text-white">Leads recentes</div>
              <div className="mt-1 text-sm text-zinc-500">
                Últimos contatos cadastrados no CRM
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-400">
                Carregando leads...
              </div>
            ) : leads.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-400">
                Nenhum lead registrado ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeads.slice(0, 8).map((lead) => {
                  const previewScore = getLeadScore(lead, [], []);
                  const previewTemp = getLeadTemperature(previewScore);
                  const previewHealth = getLeadHealth(lead.updatedAt, lead.status);

                  return (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => openLeadModal(lead)}
                      className="flex w-full flex-col gap-4 rounded-3xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-[#3BFF8C]/30 hover:bg-white/[0.02] md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{lead.name}</div>

                        <div className="mt-1 text-xs text-zinc-500">
                          {lead.companyName || 'Sem empresa'}
                          {lead.email ? ' • ' + lead.email : ''}
                          {lead.phone ? ' • ' + lead.phone : ''}
                        </div>

                        <div className="mt-2 text-xs text-zinc-500">
                          Responsável: {lead.ownerUser?.name || getUserLabel(lead.ownerUserId)}
                          {' • '}
                          Filial: {lead.branch?.name || getBranchLabel(lead.branchId)}
                        </div>

                        <div className="mt-2 text-xs text-zinc-500">
                          Criado em {new Date(lead.createdAt).toLocaleString('pt-BR')}
                          {' • '}
                          Atualizado {formatRelativeTime(lead.updatedAt)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={statusBadge(lead.status)}>{STATUS_LABELS[lead.status]}</span>
                        <span className={`rounded-full border px-3 py-1 text-xs ${getTemperatureChipClass(previewScore)}`}>
                          {previewTemp} · {previewScore}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs ${getLeadHealthClass(lead.updatedAt, lead.status)}`}>
                          {previewHealth}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5 xl:col-span-4">
          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
            <div className="mb-4 text-sm font-medium text-white">Ações rápidas</div>

            <div className="space-y-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
              >
                Novo lead
              </button>

              <button
                onClick={scrollToPipeline}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
              >
                Ver pipeline
              </button>

              <button className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
                Relatório de vendas
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#111113] p-5">
            <div className="mb-4 text-sm font-medium text-white">Insights do CRM</div>

            <div className="space-y-3">
              <CrmInsightCard
                label="Maior concentração"
                value={
                  STATUS_LABELS[
                    STATUS_ORDER.reduce(
                      (best, current) =>
                        filteredPipeline[current].length > filteredPipeline[best].length ? current : best,
                      'NEW',
                    )
                  ]
                }
                helper="Etapa com mais leads no momento"
              />

              <CrmInsightCard
                label="Responsável com mais leads"
                value={topOwner ? `${topOwner[0]} · ${topOwner[1]}` : 'Sem dados'}
                helper="Distribuição comercial atual"
              />

              <CrmInsightCard
                label="Prioridade operacional"
                value={
                  stats.stalledLeads > 0
                    ? `Retomar ${stats.stalledLeads} lead(s) em atenção`
                    : 'Pipeline com ritmo saudável'
                }
                helper="Recomendação automática baseada na atividade"
              />
            </div>
          </div>
        </div>
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(59,255,140,0.08)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Novo lead</h3>
                <p className="mt-1 text-sm text-zinc-500">Cadastre um novo contato no CRM</p>
              </div>

              <button
                onClick={closeCreateModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Nome</label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#3BFF8C]/40"
                    placeholder="Nome do lead"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Telefone</label>
                  <input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#3BFF8C]/40"
                    placeholder="Telefone"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">E-mail</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#3BFF8C]/40"
                    placeholder="email@empresa.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">Empresa</label>
                  <input
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#3BFF8C]/40"
                    placeholder="Empresa do lead"
                  />
                </div>

                <div ref={createStatusMenuRef} className="relative">
                  <label className="mb-2 block text-sm text-zinc-400">Status</label>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateStatusMenuOpen((prev) => !prev);
                      setIsCreateOwnerMenuOpen(false);
                      setIsCreateBranchMenuOpen(false);
                      setIsCreateDepartmentMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-3 text-left text-sm text-white transition hover:border-[#3BFF8C]/25 hover:bg-white/[0.03]"
                  >
                    <span>{STATUS_LABELS[formStatus]}</span>
                    <span className={isCreateStatusMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                      &#9662;
                    </span>
                  </button>

                  {isCreateStatusMenuOpen ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                      <div className="space-y-1">
                        {STATUS_ORDER.map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              setFormStatus(status);
                              setIsCreateStatusMenuOpen(false);
                            }}
                            className={
                              formStatus === status
                                ? 'flex w-full items-center justify-between rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-sm text-white'
                                : 'flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white'
                            }
                          >
                            <span>{STATUS_LABELS[status]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div ref={createOwnerMenuRef} className="relative">
                  <label className="mb-2 block text-sm text-zinc-400">Responsável</label>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateOwnerMenuOpen((prev) => !prev);
                      setIsCreateStatusMenuOpen(false);
                      setIsCreateBranchMenuOpen(false);
                      setIsCreateDepartmentMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-3 text-left text-sm text-white transition hover:border-[#3BFF8C]/25 hover:bg-white/[0.03]"
                  >
                    <span>{formOwnerUserId === 'NONE' ? 'Não definido' : getUserLabel(formOwnerUserId)}</span>
                    <span className={isCreateOwnerMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                      &#9662;
                    </span>
                  </button>

                  {isCreateOwnerMenuOpen ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormOwnerUserId('NONE');
                            setIsCreateOwnerMenuOpen(false);
                          }}
                          className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
                        >
                          Não definido
                        </button>

                        {users.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              setFormOwnerUserId(user.id);
                              setIsCreateOwnerMenuOpen(false);
                            }}
                            className={
                              formOwnerUserId === user.id
                                ? 'flex w-full rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-sm text-white'
                                : 'flex w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white'
                            }
                          >
                            {user.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div ref={createBranchMenuRef} className="relative">
                  <label className="mb-2 block text-sm text-zinc-400">Filial</label>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateBranchMenuOpen((prev) => !prev);
                      setIsCreateStatusMenuOpen(false);
                      setIsCreateOwnerMenuOpen(false);
                      setIsCreateDepartmentMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-3 text-left text-sm text-white transition hover:border-[#3BFF8C]/25 hover:bg-white/[0.03]"
                  >
                    <span>{formBranchId === 'NONE' ? 'Não definida' : getBranchLabel(formBranchId)}</span>
                    <span className={isCreateBranchMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                      &#9662;
                    </span>
                  </button>

                  {isCreateBranchMenuOpen ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormBranchId('NONE');
                            setFormDepartmentId('NONE');
                            setIsCreateBranchMenuOpen(false);
                          }}
                          className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
                        >
                          Não definida
                        </button>

                        {branches.map((branch) => (
                          <button
                            key={branch.id}
                            type="button"
                            onClick={() => {
                              setFormBranchId(branch.id);
                              setFormDepartmentId('NONE');
                              setIsCreateBranchMenuOpen(false);
                            }}
                            className={
                              formBranchId === branch.id
                                ? 'flex w-full rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-sm text-white'
                                : 'flex w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white'
                            }
                          >
                            {branch.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div ref={createDepartmentMenuRef} className="relative">
                  <label className="mb-2 block text-sm text-zinc-400">Departamento</label>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateDepartmentMenuOpen((prev) => !prev);
                      setIsCreateStatusMenuOpen(false);
                      setIsCreateOwnerMenuOpen(false);
                      setIsCreateBranchMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-3 text-left text-sm text-white transition hover:border-[#3BFF8C]/25 hover:bg-white/[0.03]"
                  >
                    <span>{formDepartmentId === 'NONE' ? 'Não definido' : getDepartmentLabel(formDepartmentId)}</span>
                    <span className={isCreateDepartmentMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                      &#9662;
                    </span>
                  </button>

                  {isCreateDepartmentMenuOpen ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormDepartmentId('NONE');
                            setIsCreateDepartmentMenuOpen(false);
                          }}
                          className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
                        >
                          Não definido
                        </button>

                        {createDepartments.map((department) => (
                          <button
                            key={department.id}
                            type="button"
                            onClick={() => {
                              setFormDepartmentId(department.id);
                              setIsCreateDepartmentMenuOpen(false);
                            }}
                            className={
                              formDepartmentId === department.id
                                ? 'flex w-full rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-sm text-white'
                                : 'flex w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white'
                            }
                          >
                            {department.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Observações</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#3BFF8C]/40"
                  placeholder="Observações do lead"
                />
              </div>

              {formError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {formError}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-2xl bg-[#3BFF8C] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                >
                  {creating ? 'Criando...' : 'Criar lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedLead ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-6">
          <div className="flex min-h-full items-center justify-center">
            <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(59,255,140,0.08)]">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    {editingLead ? 'Editar lead' : selectedLead.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {editingLead
                      ? 'Atualize os dados do lead no CRM'
                      : 'Visão premium do lead com score, timeline e follow-ups'}
                  </p>
                </div>

                <button
                  onClick={closeLeadModal}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
                >
                  Fechar
                </button>
              </div>

              {leadModalError ? (
                <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
                  {leadModalError}
                </div>
              ) : null}

              <div className="crm-scroll overflow-y-auto pr-2">
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                  <div className="space-y-5 xl:col-span-4">
                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-white">Lead intelligence</div>
                        <span className={statusBadge(selectedLead.status)}>
                          {STATUS_LABELS[selectedLead.status]}
                        </span>
                      </div>

                      <div className="rounded-[28px] border border-[#3BFF8C]/15 bg-[radial-gradient(circle_at_top,rgba(59,255,140,0.12),transparent_70%),rgba(255,255,255,0.02)] p-5">
                        <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          Score do lead
                        </div>
                        <div className="mt-4 flex items-end gap-3">
                          <div className="text-5xl font-semibold text-[#3BFF8C]">
                            {selectedLeadScore}
                          </div>
                          <div className="pb-2 text-sm text-zinc-400">/ 100</div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={`rounded-full border px-3 py-1 text-xs ${getTemperatureChipClass(selectedLeadScore)}`}>
                            {selectedLeadTemperature}
                          </span>
                          <span className={`rounded-full border px-3 py-1 text-xs ${getLeadHealthClass(selectedLead?.updatedAt, selectedLead?.status)}`}>
                            {selectedLeadHealth}
                          </span>
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-[#3BFF8C] transition-all"
                            style={{ width: `${selectedLeadScore}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 text-sm text-zinc-300">
                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                            Responsável
                          </div>
                          <div className="mt-1 break-all">
                            {selectedLead.ownerUser?.name || getUserLabel(selectedLead.ownerUserId)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                            Filial
                          </div>
                          <div className="mt-1 break-all">
                            {selectedLead.branch?.name || getBranchLabel(selectedLead.branchId)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                            Departamento
                          </div>
                          <div className="mt-1 break-all">
                            {selectedLead.department?.name || getDepartmentLabel(selectedLead.departmentId)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                            Criado em
                          </div>
                          <div className="mt-1">{formatDateTime(selectedLead.createdAt)}</div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                            Última atualização
                          </div>
                          <div className="mt-1">
                            {formatDateTime(selectedLead.updatedAt)} · {formatRelativeTime(selectedLead.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      <div className="mb-4 text-sm font-medium text-white">Resumo operacional</div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Tarefas abertas</div>
                          <div className="mt-2 text-2xl font-semibold text-white">{selectedLeadOpenTasks.length}</div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Em atraso</div>
                          <div className="mt-2 text-2xl font-semibold text-white">{selectedLeadOverdueTasks.length}</div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          Próxima prioridade
                        </div>
                        <div className="mt-2 text-sm text-white">
                          {selectedLeadOverdueTasks.length > 0
                            ? `Concluir ${selectedLeadOverdueTasks.length} tarefa(s) em atraso`
                            : selectedLeadOpenTasks.length > 0
                            ? 'Executar próximos follow-ups'
                            : 'Registrar nova atividade ou tarefa'}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      <div className="mb-4 text-sm font-medium text-white">Informações</div>

                      {editingLead ? (
                        <div className="space-y-4">
                          <div>
                            <label className="mb-2 block text-sm text-zinc-400">Nome</label>
                            <input
                              value={editLeadName}
                              onChange={(e) => setEditLeadName(e.target.value)}
                              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#3BFF8C]/40"
                              placeholder="Nome do lead"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm text-zinc-400">Empresa</label>
                            <input
                              value={editLeadCompanyName}
                              onChange={(e) => setEditLeadCompanyName(e.target.value)}
                              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#3BFF8C]/40"
                              placeholder="Empresa"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm text-zinc-400">E-mail</label>
                            <input
                              type="email"
                              value={editLeadEmail}
                              onChange={(e) => setEditLeadEmail(e.target.value)}
                              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#3BFF8C]/40"
                              placeholder="email@empresa.com"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm text-zinc-400">Telefone</label>
                            <input
                              value={editLeadPhone}
                              onChange={(e) => setEditLeadPhone(e.target.value)}
                              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#3BFF8C]/40"
                              placeholder="Telefone"
                            />
                          </div>

                          <div ref={editOwnerMenuRef} className="relative">
                            <label className="mb-2 block text-sm text-zinc-400">Responsável</label>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditOwnerMenuOpen((prev) => !prev);
                                setIsEditBranchMenuOpen(false);
                                setIsEditDepartmentMenuOpen(false);
                              }}
                              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left text-sm text-white outline-none focus:border-[#3BFF8C]/40"
                            >
                              <span>{editOwnerUserId === 'NONE' ? 'Não definido' : getUserLabel(editOwnerUserId)}</span>
                              <span className={isEditOwnerMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                                &#9662;
                              </span>
                            </button>

                            {isEditOwnerMenuOpen ? (
                              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                                <div className="space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditOwnerUserId('NONE');
                                      setIsEditOwnerMenuOpen(false);
                                    }}
                                    className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
                                  >
                                    Não definido
                                  </button>

                                  {users.map((user) => (
                                    <button
                                      key={user.id}
                                      type="button"
                                      onClick={() => {
                                        setEditOwnerUserId(user.id);
                                        setIsEditOwnerMenuOpen(false);
                                      }}
                                      className={
                                        editOwnerUserId === user.id
                                          ? 'flex w-full rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-sm text-white'
                                          : 'flex w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white'
                                      }
                                    >
                                      {user.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>

                          <div ref={editBranchMenuRef} className="relative">
                            <label className="mb-2 block text-sm text-zinc-400">Filial</label>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditBranchMenuOpen((prev) => !prev);
                                setIsEditOwnerMenuOpen(false);
                                setIsEditDepartmentMenuOpen(false);
                              }}
                              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left text-sm text-white outline-none focus:border-[#3BFF8C]/40"
                            >
                              <span>{editBranchId === 'NONE' ? 'Não definida' : getBranchLabel(editBranchId)}</span>
                              <span className={isEditBranchMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                                &#9662;
                              </span>
                            </button>

                            {isEditBranchMenuOpen ? (
                              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                                <div className="space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditBranchId('NONE');
                                      setEditDepartmentId('NONE');
                                      setIsEditBranchMenuOpen(false);
                                    }}
                                    className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
                                  >
                                    Não definida
                                  </button>

                                  {branches.map((branch) => (
                                    <button
                                      key={branch.id}
                                      type="button"
                                      onClick={() => {
                                        setEditBranchId(branch.id);
                                        setEditDepartmentId('NONE');
                                        setIsEditBranchMenuOpen(false);
                                      }}
                                      className={
                                        editBranchId === branch.id
                                          ? 'flex w-full rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-sm text-white'
                                          : 'flex w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white'
                                      }
                                    >
                                      {branch.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>

                          <div ref={editDepartmentMenuRef} className="relative">
                            <label className="mb-2 block text-sm text-zinc-400">Departamento</label>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditDepartmentMenuOpen((prev) => !prev);
                                setIsEditOwnerMenuOpen(false);
                                setIsEditBranchMenuOpen(false);
                              }}
                              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left text-sm text-white outline-none focus:border-[#3BFF8C]/40"
                            >
                              <span>{editDepartmentId === 'NONE' ? 'Não definido' : getDepartmentLabel(editDepartmentId)}</span>
                              <span className={isEditDepartmentMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                                &#9662;
                              </span>
                            </button>

                            {isEditDepartmentMenuOpen ? (
                              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                                <div className="space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditDepartmentId('NONE');
                                      setIsEditDepartmentMenuOpen(false);
                                    }}
                                    className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
                                  >
                                    Não definido
                                  </button>

                                  {editDepartments.map((department) => (
                                    <button
                                      key={department.id}
                                      type="button"
                                      onClick={() => {
                                        setEditDepartmentId(department.id);
                                        setIsEditDepartmentMenuOpen(false);
                                      }}
                                      className={
                                        editDepartmentId === department.id
                                          ? 'flex w-full rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-sm text-white'
                                          : 'flex w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white'
                                      }
                                    >
                                      {department.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 text-sm text-zinc-300">
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Nome</div>
                            <div className="mt-1">{selectedLead.name}</div>
                          </div>

                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Empresa</div>
                            <div className="mt-1">{selectedLead.companyName || 'Sem empresa'}</div>
                          </div>

                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">E-mail</div>
                            <div className="mt-1">{selectedLead.email || 'Não informado'}</div>
                          </div>

                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Telefone</div>
                            <div className="mt-1">{selectedLead.phone || 'Não informado'}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      <div className="mb-4 text-sm font-medium text-white">Pipeline e observações</div>

                      <div className="space-y-4 text-sm text-zinc-300">
                        <div ref={statusMenuRef} className="relative">
                          <div className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">Status</div>

                          <button
                            type="button"
                            onClick={() => setIsStatusMenuOpen((prev) => !prev)}
                            disabled={updatingLeadId === selectedLead.id || savingLeadDetails || deletingLead}
                            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-3 text-left text-sm text-white transition hover:border-[#3BFF8C]/25 hover:bg-white/[0.03] disabled:opacity-60"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`h-2.5 w-2.5 rounded-full ${statusDotClass(selectedLead.status)}`} />
                              <span>{STATUS_LABELS[selectedLead.status]}</span>
                            </div>

                            <span className={isStatusMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                              &#9662;
                            </span>
                          </button>

                          {isStatusMenuOpen ? (
                            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                              <div className="space-y-1">
                                {STATUS_ORDER.map((status) => {
                                  const active = selectedLead.status === status;

                                  return (
                                    <button
                                      key={status}
                                      type="button"
                                      onClick={() => handleMoveLead(selectedLead.id, status)}
                                      disabled={active || updatingLeadId === selectedLead.id || savingLeadDetails || deletingLead}
                                      className={
                                        active
                                          ? 'flex w-full items-center justify-between rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-sm text-white'
                                          : 'flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50'
                                      }
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={`h-2.5 w-2.5 rounded-full ${statusDotClass(status)}`} />
                                        <span>{STATUS_LABELS[status]}</span>
                                      </div>

                                      {active ? <span className="h-2.5 w-2.5 rounded-full bg-[#3BFF8C]" /> : null}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div>
                          <div className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Observações</div>
                          {editingLead ? (
                            <textarea
                              value={editLeadNotes}
                              onChange={(e) => setEditLeadNotes(e.target.value)}
                              className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#3BFF8C]/40"
                              placeholder="Observações do lead"
                            />
                          ) : (
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-zinc-300">
                              {selectedLead.notes || 'Nenhuma observação registrada para este lead.'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 xl:col-span-8">
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                      <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-white">Timeline</div>
                          <div className="text-xs text-zinc-500">{activities.length} evento(s)</div>
                        </div>

                        <div className="mb-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                          <div className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                            Registrar interação
                          </div>

                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {INTERACTION_OPTIONS.map((option) => (
                              <button
                                key={option.type}
                                type="button"
                                onClick={() => {
                                  setActivityType(option.type);
                                  setShowActivityComposer(true);
                                }}
                                className="flex min-h-[58px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium leading-none text-white transition hover:bg-white/10"
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>

                          {showActivityComposer ? (
                            <div className="mt-4 space-y-3">
                              <div>
                                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">
                                  Tipo
                                </label>
                                <div className="rounded-2xl border border-white/10 bg-[#111113] px-4 py-3 text-sm text-white">
                                  {ACTIVITY_LABELS[activityType]}
                                </div>
                              </div>

                              <div>
                                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">
                                  Descrição
                                </label>
                                <textarea
                                  value={activityDescription}
                                  onChange={(e) => setActivityDescription(e.target.value)}
                                  className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-[#111113] px-4 py-3 text-sm text-white outline-none focus:border-[#3BFF8C]/40"
                                  placeholder="Descreva a interação com o lead"
                                />
                              </div>

                              <div className="flex flex-wrap justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={resetActivityForm}
                                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
                                >
                                  Cancelar
                                </button>

                                <button
                                  type="button"
                                  onClick={handleCreateActivity}
                                  disabled={creatingActivity}
                                  className="rounded-2xl bg-[#3BFF8C] px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                                >
                                  {creatingActivity ? 'Salvando...' : 'Salvar interação'}
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {loadingLeadExtras ? (
                          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">
                            Carregando timeline...
                          </div>
                        ) : activities.length === 0 ? (
                          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-500">
                            Nenhuma atividade registrada ainda.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {activities.map((activity) => (
                              <div
                                key={activity.id}
                                className="rounded-2xl border border-white/10 bg-black/30 p-4"
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-[11px] font-semibold tracking-[0.08em] shadow-[0_0_18px_rgba(255,255,255,0.04)] ${activityIconBadgeClass(activity.type)}`}
                                  >
                                    {activityIcon(activity.type)}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <div className="text-sm font-medium text-white">
                                        {sanitizeText(ACTIVITY_LABELS[activity.type] || activity.type)}
                                      </div>
                                      <div className="text-xs text-zinc-500">
                                        {formatDateTime(activity.createdAt)}
                                      </div>
                                    </div>

                                    <div className="mt-2 text-sm leading-6 text-zinc-300">
                                      {sanitizeText(activity.description)}
                                    </div>

                                    <div className="mt-2 text-xs text-zinc-500">
                                      {activity.user?.name || 'Sistema'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-white">Tarefas e follow-ups</div>
                          <div className="text-xs text-zinc-500">
                            {tasks.filter((task) => !task.completedAt).length} pendente(s)
                          </div>
                        </div>

                        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                          <div>
                            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">
                              Título
                            </label>
                            <input
                              value={taskTitle}
                              onChange={(e) => setTaskTitle(e.target.value)}
                              className="w-full rounded-2xl border border-white/10 bg-[#111113] px-4 py-3 text-sm text-white outline-none focus:border-[#3BFF8C]/40"
                              placeholder="Ex.: Retornar proposta"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">
                              Descrição
                            </label>
                            <textarea
                              value={taskDescription}
                              onChange={(e) => setTaskDescription(e.target.value)}
                              className="min-h-[88px] w-full rounded-2xl border border-white/10 bg-[#111113] px-4 py-3 text-sm text-white outline-none focus:border-[#3BFF8C]/40"
                              placeholder="Detalhes do follow-up"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">
                              Prazo
                            </label>
                            <input
                              type="datetime-local"
                              value={taskDueAt}
                              onChange={(e) => setTaskDueAt(e.target.value)}
                              className="w-full rounded-2xl border border-white/10 bg-[#111113] px-4 py-3 text-sm text-white outline-none focus:border-[#3BFF8C]/40"
                            />
                          </div>

                          <div ref={taskAssignedUserMenuRef} className="relative">
                            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-zinc-500">
                              Responsável
                            </label>

                            <button
                              type="button"
                              onClick={() => setIsTaskAssignedUserMenuOpen((prev) => !prev)}
                              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#111113] px-4 py-3 text-left text-sm text-white transition hover:border-[#3BFF8C]/25"
                            >
                              <span>
                                {taskAssignedUserId === 'NONE'
                                  ? 'Não definido'
                                  : getUserLabel(taskAssignedUserId)}
                              </span>
                              <span className={isTaskAssignedUserMenuOpen ? 'rotate-180 text-zinc-400 transition' : 'text-zinc-400 transition'}>
                                &#9662;
                              </span>
                            </button>

                            {isTaskAssignedUserMenuOpen ? (
                              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#0D0E10]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                                <div className="space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTaskAssignedUserId('NONE');
                                      setIsTaskAssignedUserMenuOpen(false);
                                    }}
                                    className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
                                  >
                                    Não definido
                                  </button>

                                  {users.map((user) => (
                                    <button
                                      key={user.id}
                                      type="button"
                                      onClick={() => {
                                        setTaskAssignedUserId(user.id);
                                        setIsTaskAssignedUserMenuOpen(false);
                                      }}
                                      className={
                                        taskAssignedUserId === user.id
                                          ? 'flex w-full rounded-xl border border-[#3BFF8C]/20 bg-[radial-gradient(circle_at_left,rgba(59,255,140,0.14),transparent_70%),rgba(59,255,140,0.08)] px-3 py-3 text-left text-sm text-white'
                                          : 'flex w-full rounded-xl px-3 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white'
                                      }
                                    >
                                      {user.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            onClick={handleCreateTask}
                            disabled={creatingTask}
                            className="w-full rounded-2xl bg-[#3BFF8C] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                          >
                            {creatingTask ? 'Criando tarefa...' : 'Criar tarefa'}
                          </button>
                        </div>

                        <div className="mt-4 space-y-3">
                          {loadingLeadExtras ? (
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">
                              Carregando tarefas...
                            </div>
                          ) : tasks.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-500">
                              Nenhuma tarefa cadastrada para este lead.
                            </div>
                          ) : (
                            tasks.map((task) => {
                              const done = Boolean(task.completedAt);
                              const overdue =
                                Boolean(task.dueAt) &&
                                !done &&
                                new Date(task.dueAt as string).getTime() < Date.now();

                              return (
                                <div
                                  key={task.id}
                                  className={
                                    done
                                      ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-4 opacity-70'
                                      : 'rounded-2xl border border-white/10 bg-black/30 p-4'
                                  }
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <div className="text-sm font-medium text-white">{task.title}</div>
                                        {done ? (
                                          <span className="rounded-full border border-[#3BFF8C]/20 bg-[#3BFF8C]/10 px-2 py-1 text-[10px] text-[#9CFFC2]">
                                            Concluída
                                          </span>
                                        ) : overdue ? (
                                          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] text-red-300">
                                            Em atraso
                                          </span>
                                        ) : (
                                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-zinc-300">
                                            Pendente
                                          </span>
                                        )}
                                      </div>

                                      {task.description ? (
                                        <div className="mt-2 text-sm leading-6 text-zinc-300">
                                          {normalizeUiText(task.description)}
                                        </div>
                                      ) : null}

                                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
                                        <span>Prazo: {formatDateShort(task.dueAt)}</span>
                                        <span>
                                          Responsável: {task.assignedUser?.name || 'Não definido'}
                                        </span>
                                        {task.completedAt ? (
                                          <span>Concluída em: {formatDateShort(task.completedAt)}</span>
                                        ) : null}
                                      </div>
                                    </div>

                                    {!done ? (
                                      <button
                                        type="button"
                                        onClick={() => handleCompleteTask(task.id)}
                                        disabled={completingTaskId === task.id}
                                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white transition hover:bg-white/10 disabled:opacity-60"
                                      >
                                        {completingTaskId === task.id ? 'Concluindo...' : 'Concluir'}
                                      </button>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmModal(true)}
                  disabled={savingLeadDetails || deletingLead || updatingLeadId === selectedLead.id}
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/15 disabled:opacity-60"
                >
                  Excluir lead
                </button>

                <div className="flex flex-wrap justify-end gap-3">
                  {editingLead ? (
                    <>
                      <button
                        type="button"
                        onClick={cancelLeadEdit}
                        disabled={savingLeadDetails}
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/10 disabled:opacity-60"
                      >
                        Cancelar edição
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveLeadDetails}
                        disabled={savingLeadDetails}
                        className="rounded-2xl bg-[#3BFF8C] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                      >
                        {savingLeadDetails ? 'Salvando...' : 'Salvar alterações'}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={enableLeadEdit}
                      className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
                    >
                      Editar lead
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showDeleteConfirmModal && selectedLead ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#111113] p-6 shadow-[0_0_80px_rgba(255,70,70,0.10)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-white">Excluir lead</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Esta ação removerá o lead do CRM permanentemente.
                </p>
              </div>

              <button
                onClick={closeDeleteConfirmModal}
                disabled={deletingLead}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10 disabled:opacity-60"
              >
                Fechar
              </button>
            </div>

            <div className="rounded-3xl border border-red-500/15 bg-red-500/5 p-5">
              <div className="text-sm text-zinc-300">
                Você está prestes a excluir o lead{' '}
                <span className="font-semibold text-white">{selectedLead.name}</span>.
              </div>
              <div className="mt-2 text-sm text-zinc-400">Essa ação não pode ser desfeita.</div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteConfirmModal}
                disabled={deletingLead}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/10 disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDeleteLead}
                disabled={deletingLead}
                className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {deletingLead ? 'Excluindo...' : 'Confirmar exclusão'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}