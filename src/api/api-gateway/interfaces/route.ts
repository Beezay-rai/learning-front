interface Route extends BaseEntity {
  clusterId: string;
  methods: string[];
  path: string;
  id: string;
}